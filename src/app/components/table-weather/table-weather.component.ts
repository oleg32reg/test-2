import {
  Component,
  OnDestroy,
  OnInit,
  model,
  computed,
  signal,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Subject,delay, takeUntil} from 'rxjs';

import { WeatherService } from '@services/weather.service';
import { CityCoordsName } from '@interfaces/weather';
import { weatherCity } from '@interfaces/weather';
import { RESPONSE_WEATHER } from '@interfaces/api';

@Component({
  selector: 'app-table-weather',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './table-weather.component.html',
  styleUrl: './table-weather.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableWeatherComponent implements OnInit, OnDestroy {
  loader$$ = new BehaviorSubject<boolean>(true); // Стартовый лоадер
  readonly loader$ = this.loader$$.asObservable();

  dataState$$ = new BehaviorSubject<{
    type: '' | 'error' | 'message';
    status: boolean;
    text: string;
  }>({
    type: '',
    status: false,
    text: '',
  }); // Стартовый лоадер
  readonly dataState$ = this.dataState$$.asObservable();

  dataCity = model({
    lat: 0,
    lon: 0,
    name: '',
  });

  dataCityComputed = computed(() => {
    if (this.dataCity()?.name.length) {
      this.getWeatherByCity(this.dataCity());
    }
    return this.dataCity();
  });

  // можно будет(он бы тут пригодился) использовать linkedSignal - когда он будет не в стадии DEV(developer preview) в Angular
  dataWeather: WritableSignal<weatherCity[]> = signal([]);
  dataWeatherComputed = computed(() => {
    return this.dataWeather();
  });
  isMessageAutocomplete = signal(false);
  isMessageAutocompleteComputed = computed(() => this.isMessageAutocomplete());
  destroy$: Subject<any> = new Subject<any>();
  constructor(private weatherService: WeatherService) {}
  getWeatherByCity(city: CityCoordsName) {
    this.loader$$.next(true);
    this.dataState$$.next({ ...this.dataState$$.getValue(), status: false });
    this.weatherService
      .getCityWeather(city)
      .pipe(delay(500))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RESPONSE_WEATHER) => {
          if (response.cod === '200' && response.list?.length) {
            this.dataWeather.set(response.list);
          } else {
            this.dataState$$.next({
              ...this.dataState$$.getValue(),
              status: true,
              type: 'message',
            });
            this.dataWeather.set([]);
          }
          this.loader$$.next(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loader$$.next(false);
          this.dataState$$.next({
            ...this.dataState$$.getValue(),
            status: true,
            type: 'error',
            text: error.error?.message || 'Ошибка получения данных',
          });
        },
      });
  }

  ngOnInit(): void {}
  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
