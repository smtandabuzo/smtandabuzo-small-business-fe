import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../models/item';
import { ItemService } from '../../services/item';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h3>Items List</h3>
    <div *ngIf="items.length === 0" class="alert alert-info">
      No items found. <a routerLink="/new">Add an item</a>
    </div>
    <ul class="list-group" *ngIf="items.length > 0">
      <li class="list-group-item" *ngFor="let item of items">
        <h5>{{ item.name }}</h5>
        <p class="mb-1">{{ item.description }}</p>
      </li>
    </ul>
    <div class="mt-3">
      <a routerLink="/new" class="btn btn-primary">Add New Item</a>
    </div>
  `,
  styles: [``]
})
export class ItemList implements OnInit {
  items: Item[] = [];

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe({
      next: (items) => this.items = items,
      error: (err) => console.error('Error loading items', err)
    });
  }
}
