import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, WritableSignal, computed, model, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Subject, BehaviorSubject, delay, debounceTime, takeUntil } from 'rxjs';

import { WeatherService } from '@services/weather.service';
import { City, CityCoordsName, ErrorStateAutoComplete } from '@interfaces/weather';
import { RESPONSE_CITY_DETAIL} from '@interfaces/api';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent implements OnInit, OnDestroy {
  isAutocompleteEmpty = signal(true);
  isOpenAutocomplete = signal(false);

  isMessageAutocomplete = signal(false);
  isMessageAutocompleteComputed = computed(() => this.isMessageAutocomplete());

  errorSignal: WritableSignal<ErrorStateAutoComplete> = signal(
    this.weatherService.getDefaultErrorAutocomplete()
  );
  errorSignalComputed = computed(() => this.errorSignal());

  loaderSignal = signal(false);
  loaderSignalComputed = computed(() => this.loaderSignal());

  dataCity = model(this.weatherService.getDefaultDataAutocomplete());
  searchCityForm: FormGroup = this.fb.group({
    fieldName: new FormControl({
      value: '',
      disabled: this.loaderSignalComputed(),
    }),
  });
  searchCityFormControls = {
    fieldName: this.searchCityForm.get('fieldName'),
  };
  cities$$ = new BehaviorSubject<City[]>([]); // Список городов
  readonly cities$ = this.cities$$.asObservable();

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private weatherService: WeatherService
  ) {}
    /**
     * Блокирование формы
     * @param isState флаг блокирования
     */
  lockForm(isState?: boolean) {
    const isResultState: boolean = isState || false;
    if (isState) {
      this.searchCityFormControls.fieldName?.disable({ emitEvent: false });
    } else {
      this.searchCityFormControls.fieldName?.enable({ emitEvent: false });
    }
    this.loaderSignal.set(isResultState);
  }
  /**
   * Выбор города из списка
   * @param city данные города
   */
  selectCity(city: City) {
    let cityName = city.name;
    if (city.state) {
      cityName += `, ${city.state}`;
    }
    if (city.country) {
      cityName += `, ${city.country}`;
    }
    const paramCity: CityCoordsName = {
      lat: city.lat,
      lon: city.lon,
      name: cityName,
    };
    this.dataCity.update((oldValue) => paramCity);
    this.cities$$.next([]);
    this.isOpenAutocomplete.set(false);
  }
  /**
   * Поиск городов по названию
   * @param cityName название города
   */
  searchCity(cityName: string) {
    this.lockForm(true);
    this.cities$$.next([]);
    this.errorSignal.set(this.weatherService.getDefaultErrorAutocomplete());
    this.weatherService
      .getCityCoord(cityName)
      .pipe(delay(500))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responseCity: RESPONSE_CITY_DETAIL[]) => {
          if (responseCity.length) {
            this.cities$$.next(responseCity);
            this.isOpenAutocomplete.set(true);
            this.isAutocompleteEmpty.set(false);
            this.isMessageAutocomplete.set(false);
          } else {
            this.isOpenAutocomplete.set(false);
            this.isMessageAutocomplete.set(true);
          }
          this.lockForm();
        },
        error: (errorResponse: HttpErrorResponse) => {
          let errorState: ErrorStateAutoComplete = {
            ...this.errorSignal(),
            status: true,
          };
          if (errorResponse.error?.message) {
            errorState.text = errorResponse.error?.message;
          }
          this.errorSignal.set(errorState);
          this.lockForm();
          this.isOpenAutocomplete.set(false);
          this.isMessageAutocomplete.set(false);
        },
      });
  }
  /**
   * Сброс по клику на "сбросить"
   */
  onReset() {
    this.isMessageAutocomplete.set(false);
    this.errorSignal.set(this.weatherService.getDefaultErrorAutocomplete());
    this.resetResult();
    this.resetDataAutocomplete();
  }
  /**
   * Сброс данных
   */
  resetDataAutocomplete() {
    this.dataCity.update((oldValue) =>
      this.weatherService.getDefaultDataAutocomplete()
    );
  }
  /**
   * Сброс общего состояния
   */
  resetResult() {
    this.lockForm();
    this.cities$$.next([]);
    this.isOpenAutocomplete.set(false);
    this.isAutocompleteEmpty.set(true);
  }

  ngOnInit(): void {
    this.searchCityFormControls.fieldName?.valueChanges
      .pipe(debounceTime(500))
      .pipe(takeUntil(this.destroy$))
      .subscribe((inputFieldValue) => {
        if (inputFieldValue?.length) {
          this.searchCity(inputFieldValue);
        } else {
          this.onReset();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
