import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GET_PARAMS, GET_PARAMS_PARAMS } from '@interfaces/api';
import { CityCoordsName, ErrorStateAutoComplete } from '@interfaces/weather';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private apiService: ApiService) {}
  /**
   * Дефолтное состояние данных о городе
   * @returns
   */
  getDefaultDataAutocomplete(): CityCoordsName {
    return {
      lat: 0,
      lon: 0,
      name: '',
    };
  }
  /**
   * Дефолтное состояние стейта ошибки
   * @returns
   */
  getDefaultErrorAutocomplete(): ErrorStateAutoComplete {
    return {
      status: false,
      text: ''
    };
  }
  /**
   * Получение координат по имени города
   * @param name имя города
   * @returns
   */
  getCityCoord(name: string) {
    const params: GET_PARAMS_PARAMS = {
      q: name,
      limit: 10,
    };
    return this.apiService
      .GET({
        url: 'http://api.openweathermap.org/geo/1.0/direct',
        params,
      })
      .pipe(retry(1));
  }
  /**
   * Получение погоды по данным городу
   * @param city город
   * @returns
   */
  getCityWeather(city: CityCoordsName) {
    const params: GET_PARAMS_PARAMS = {
      lat: city.lat,
      lon: city.lon,
      cnt: 9,
      units: 'metric',
    };
    return this.apiService.GET({
      url: 'https://api.openweathermap.org/data/2.5/forecast',
      params,
    }).pipe(retry(1));
  }
}
