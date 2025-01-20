import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, WritableSignal, computed, model, signal } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
import { HttpErrorResponse} from '@angular/common/http';
import { ActivatedRoute, Params, Router, RouterState } from '@angular/router';
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
  dataCityComputed = computed(() => {
    // this.setParamsCityInRoute(this.dataCity());
    this.setParamsCityInRoute(this.dataCity());
    return this.dataCity();
  });

  searchCityFormControls = {
    fieldName: this.searchCityForm.get('fieldName'),
  };
  cities$$ = new BehaviorSubject<City[]>([]); // Список городов
  readonly cities$ = this.cities$$.asObservable();

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private weatherService: WeatherService,
    private router: Router,
    private aRouter: ActivatedRoute,
    private loc: Location
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
   * Выбор города из списка и склеивание названия
   * @param city данные города
   */
  selectCity(city: City) {
    let cityName = city.name;
    if (city.state) {
      cityName += `,${city.state}`;
    }
    if (city.country) {
      cityName += `,${city.country}`;
    }
    const paramCity: CityCoordsName = {
      lat: city.lat,
      lon: city.lon,
      name: cityName,
    };
    this.syncCityParams(paramCity);
  }
  /**
   * Делегирование в модель данных города
   * @param paramCity данные о городе
   */
  syncCityParams(paramCity: CityCoordsName) {
    if (this.searchCityFormControls.fieldName?.value !== paramCity.name){
      this.searchCityFormControls.fieldName?.patchValue(paramCity.name, {
        emitEvent: false, // отключение события изменения значения в инпуте(при использования слушателя "valueChanges")
      });
    }
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
    const defaultValueCity:CityCoordsName = this.weatherService.getDefaultDataAutocomplete();
    this.dataCity.update((oldValue) => defaultValueCity);
    // this.setParamsCityInRoute(defaultValueCity);
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
  /**
   * Установка параметров выбранного города в запрос
   * @param cityParams параметры выбранного города
   */
  setParamsCityInRoute(cityParams: CityCoordsName) {
    const queryParams = cityParams.name && cityParams.lat && cityParams.lon ? cityParams : {};
    const urlWidthParams = this.router
      .createUrlTree([], { relativeTo: this.aRouter, queryParams})
      .toString();
    this.loc.go(urlWidthParams);
  }
  ngOnInit(): void {
    // считвание параметров из урла, если есть все необходимые параметры: lat,lon,name
    this.aRouter.queryParams.pipe(takeUntil(this.destroy$)).subscribe({
      next: (routeParams: Params) => {
        // const codec = new HttpUrlEncodingCodec();
        const currentCity: CityCoordsName = {
          lat: routeParams['lat'],
          lon: routeParams['lon'],
          // name: codec.encodeValue(routeParams['name'])
          name: routeParams['name'],
        };
        if (currentCity.lat && currentCity.lon && currentCity.name) {
          this.syncCityParams(currentCity);
        }
      },
    });

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
