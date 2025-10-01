import { Routes } from '@angular/router';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      { 
        path: 'login', 
        component: LoginComponent,
        canActivate: [NoAuthGuard]
      },
      { 
        path: 'signup', 
        component: SignupComponent,
        canActivate: [NoAuthGuard]
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ItemList },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'invoices/new', component: InvoiceFormComponent },
      { path: 'invoices/:id', component: InvoiceDetailComponent },
      { path: 'invoices/edit/:id', component: InvoiceFormComponent },
      { path: 'clients', component: ItemList },
      { path: 'products', component: ItemList },
      { path: 'expenses', component: ItemList },
      { 
        path: 'reports', 
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [AuthGuard]
      },
      { path: 'settings', component: ItemList }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
