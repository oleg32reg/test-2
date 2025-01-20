import { Routes } from '@angular/router';
import { NotFoundPageComponent } from '@pages/not-found-page/not-found-page.component';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/main-page/main-page.component').then(
        (c) => c.MainPageComponent
      ),
    title: 'Прогноз погоды на 5 дней',
    data: { lat:0, lon:0 }
  },
  {
    path: '**',
    component: NotFoundPageComponent,
    title: 'Страница не найдена',
    data: { cssClass: 'ng-page-404' },
  },
];
