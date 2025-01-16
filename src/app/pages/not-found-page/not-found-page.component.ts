import { Component } from '@angular/core';
import { NotFoundComponent } from '@components/not-found/not-found.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [NotFoundComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
})
export class NotFoundPageComponent {}
