import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GET_PARAMS } from '@interfaces/api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private httpc:HttpClient
  ) {}

  /**
   * Получения данных от API
   * @param paramsGET параметры запроса
   * @returns
   */
  GET(paramsGET: GET_PARAMS): Observable<any> {
    const url: string = paramsGET.url;
    const API_KEY = '010721642521f31b0fbc8c3831d45951'
    let params: HttpParams = new HttpParams();

    if (paramsGET.params) {
      params = new HttpParams({
        fromObject: { ...paramsGET.params, appid: API_KEY },
      });
    }
    const options = {
      params,
    };
    return this.httpc.get(url, options);
  }
}
