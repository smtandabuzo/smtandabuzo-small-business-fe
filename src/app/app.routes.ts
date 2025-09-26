import { Routes } from '@angular/router';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';
import { OverdueDashboardComponent } from './components/overdue-dashboard/overdue-dashboard.component';

export const routes: Routes = [
  { path: '', component: ItemList },
  { path: 'new', component: ItemForm },
  { 
    path: 'invoices', 
    children: [
      { path: '', component: InvoiceListComponent, pathMatch: 'full' },
      { path: 'new', component: InvoiceFormComponent },
      { path: ':id', component: InvoiceDetailComponent }
    ]
  },
  { path: 'overdue', component: OverdueDashboardComponent },
  { path: '**', redirectTo: '' }
];
