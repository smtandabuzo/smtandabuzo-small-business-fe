import { Routes } from '@angular/router';
import { ReportsListComponent } from './components/reports-list/reports-list.component';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportsListComponent,
    data: { title: 'Reports' },
    pathMatch: 'full'
  }
];
