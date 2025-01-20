export interface ErrorStateAutoComplete{
  status: boolean;
  text: string;
}
export interface CityCoords {
  lat: number;
  lon: number;
}
export interface CityCoordsName extends CityCoords {
  name: string;
}
export interface City extends CityCoordsName {
  local_names: {
    ru: string;
    en: string;
  };
  state?: string;
  country?:string
}
export interface CityDetailByWeather {
  id: number;
  name: string;
  coord: CityCoords;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}
export interface weatherCity {
  dt: number;
  main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
  },
  weather: [
      {
          id: number;
          main: string;
          description: string;
          icon: string;
      }
  ],
  clouds: {
      all: number;
  },
  wind: {
      speed: number;
      deg: number;
      gust: number;
  },
  visibility: number;
  pop: number;
  sys: {
      pod: string;
  },
  dt_txt: string;
}