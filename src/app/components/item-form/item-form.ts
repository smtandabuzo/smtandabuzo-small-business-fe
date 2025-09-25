import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item';
import { ItemService } from '../../services/item';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3>Add New Item</h3>
    <form (ngSubmit)="onSubmit()" class="mb-4">
      <div class="form-group mb-3">
        <label for="name" class="form-label">Name</label>
        <input type="text" class="form-control" id="name"
               [(ngModel)]="item.name" name="name" required>
      </div>
      <div class="form-group mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description"
                 [(ngModel)]="item.description" name="description" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary me-2">Save</button>
      <a routerLink="/" class="btn btn-outline-secondary">Cancel</a>
    </form>
  `,
  styles: [``]
})
export class ItemForm {
  item: Item = { name: '', description: '' };

  constructor(
    private itemService: ItemService,
    private router: Router
  ) {}

  onSubmit() {
    this.itemService.createItem(this.item).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => console.error('Error creating item', err)
    });
  }
}
