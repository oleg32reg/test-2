import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, model } from '@angular/core';
import { JsonPipe, AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { AutocompleteComponent } from "../../components/autocomplete/autocomplete.component";
import { TableWeatherComponent } from "../../components/table-weather/table-weather.component";
import { CityCoordsName } from '@interfaces/weather';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [AutocompleteComponent, TableWeatherComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent {
  loader$$ = new BehaviorSubject<boolean>(true); // Стартовый лоадер
  readonly loader$ = this.loader$$.asObservable();

  protected dataCity: WritableSignal<CityCoordsName> = model({
    lat: 0,
    lon: 0,
    name: '',
  }); // значение координат выбранного города
  protected dataCityComputed: Signal<CityCoordsName> = computed( () => this.dataCity() ); // значение координат выбранного города
}