import { City, CityCoordsName, CityDetailByWeather, weatherCity } from "./weather";

export interface GET_PARAMS_PARAMS {
  q?: string;
  limit?: number;
  lat?: number;
  lon?: number;
  cnt?: number;
  units?: string; //metric - Cel, imperial = Far ,standard(default)=Kelv
  lang?: string
}
export interface GET_PARAMS_PARAMS_BY_ID {
  appid: string;
}

export interface GET_PARAMS {
  url: string;
  params?: GET_PARAMS_PARAMS;
}
export interface RESPONSE_CITY_DETAIL extends City {}

export interface RESPONSE_MAIN_FIELDS {
  cod: string;
  message: string;
}
export interface RESPONSE_WEATHER extends RESPONSE_MAIN_FIELDS {
  city: CityDetailByWeather;
  cnt: number;
  list: weatherCity[];
}