import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { REPORTS_ROUTES } from './reports.routes';
import { ReportsListComponent } from './components/reports-list/reports-list.component';

@NgModule({
  imports: [
    MatIconModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReportsListComponent,
        children: REPORTS_ROUTES
      }
    ])
  ],
  exports: [RouterModule]
})
export class ReportsModule { }
