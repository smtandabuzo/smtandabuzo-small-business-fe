import { Routes } from '@angular/router';
import { ItemList } from './components/item-list/item-list';
import { ItemForm } from './components/item-form/item-form';

export const routes: Routes = [
  { path: '', component: ItemList },
  { path: 'new', component: ItemForm },
  { path: '**', redirectTo: '' }
];
