import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/main-page/main-page.component').then((c) => c.MainPageComponent),
    title: 'Список пользователей | TEST',
    children: [],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Страница не найдена',
    data: { cssClass: 'ng-page-404' },
  },
];
