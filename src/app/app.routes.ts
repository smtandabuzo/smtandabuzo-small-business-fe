import { Routes } from '@angular/router';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
  { path: '', component: ItemList },
  { path: 'new', component: ItemForm },
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoices/new', component: InvoiceFormComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];
