import { Routes } from '@angular/router';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { provideHttpClient } from '@angular/common/http';

// Public routes (no authentication required)
export const publicRoutes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      { 
        path: 'login', 
        component: LoginComponent
      },
      { 
        path: 'signup', 
        component: SignupComponent
      },
      // Add this route for the redirect
      {
        path: 'redirect',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

// Protected routes (authentication required)
export const protectedRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        component: ItemList,
        pathMatch: 'full',
        // Provide required providers for standalone components
        providers: [provideHttpClient()]
      },
      { 
        path: '', 
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      { 
        path: 'new', 
        component: ItemForm,
        data: { roles: ['ADMIN', 'EDITOR'] },
        providers: [provideHttpClient()]
      },
      { 
        path: 'invoices', 
        component: InvoiceListComponent,
        providers: [provideHttpClient()]
      },
      { 
        path: 'invoices/new', 
        component: InvoiceFormComponent,
        data: { roles: ['ADMIN', 'EDITOR'] },
        providers: [provideHttpClient()]
      },
    ]
  }
];

// Combine all routes
const appRoutes: Routes = [
  ...publicRoutes,
  ...protectedRoutes,
  { path: '**', redirectTo: '/dashboard' } // Fallback route
];

export const routes = appRoutes;
