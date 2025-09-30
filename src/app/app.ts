import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <div class="bg-gray-800 text-white w-64 min-h-screen flex-shrink-0 transition-all duration-300 ease-in-out">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-xl font-bold">Small Business</h1>
          <p class="text-gray-400 text-sm">Track Invoice Application</p>
        </div>
        
        <!-- Navigation -->
        <nav class="mt-6">
          <div *ngFor="let item of navItems()" class="mb-1">
            <!-- Parent Menu Item -->
            <div 
              (click)="toggleSubmenu(item)"
              [ngClass]="{
                'bg-gray-900 text-white': isActive(item) || hasActiveChild(item)
              }"
              class="flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-200"
            >
              <div class="flex items-center">
                <span class="mr-3">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </div>
              <span *ngIf="item.children" class="text-gray-400">
                {{ item.isOpen ? '▼' : '▶' }}
              </span>
            </div>
            
            <!-- Submenu Items -->
            <div *ngIf="item.children && item.isOpen" class="bg-gray-700">
              <a 
                *ngFor="let child of item.children"
                [routerLink]="[child.path]"
                routerLinkActive="bg-gray-600 text-white"
                class="block pl-12 pr-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-200"
              >
                {{ child.label }}
              </a>
            </div>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation -->
        <header class="bg-white shadow-sm">
          <div class="flex justify-between items-center px-6 py-4">
            <!-- Search Bar -->
            <div class="relative w-1/3">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span class="sr-only">View notifications</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div class="relative" x-data="{ open: false }">
                <button 
                  (click)="isProfileMenuOpen = !isProfileMenuOpen"
                  class="flex items-center space-x-2 focus:outline-none"
                >
                  <span class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                    <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <span class="text-sm font-medium text-gray-700">User Name</span>
                  <svg class="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <!-- Profile Dropdown -->
                <div 
                  *ngIf="isProfileMenuOpen"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  tabindex="-1"
                >
                  <div class="py-1" role="none">
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Billing</a>
                    <div class="border-t border-gray-100"></div>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-gray-500">
            &copy; {{ currentYear }} Small Business - Track Invoice Application. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    /* Add smooth scrolling for better UX */
    html {
      scroll-behavior: smooth;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class App {
  currentYear = new Date().getFullYear();
  isProfileMenuOpen = false;
  
  navItems = signal<NavItem[]>([
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      isOpen: false
    },
    {
      path: '/invoices',
      label: 'Invoices',
      icon: '📄',
      isOpen: false,
      children: [
        { path: '/invoices', label: 'All Invoices', icon: '📋' },
        { path: '/invoices/new', label: 'Create New', icon: '➕' },
        { path: '/invoices/drafts', label: 'Drafts', icon: '📝' },
        { path: '/invoices/paid', label: 'Paid', icon: '✅' },
        { path: '/invoices/overdue', label: 'Overdue', icon: '⚠️' }
      ]
    },
    {
      path: '/clients',
      label: 'Clients',
      icon: '👥',
      isOpen: false,
      children: [
        { path: '/clients', label: 'All Clients', icon: '👥' },
        { path: '/clients/new', label: 'Add New', icon: '➕' },
        { path: '/clients/groups', label: 'Groups', icon: '🏷️' }
      ]
    },
    {
      path: '/products',
      label: 'Products',
      icon: '📦',
      isOpen: false,
      children: [
        { path: '/products', label: 'All Products', icon: '📦' },
        { path: '/products/new', label: 'Add New', icon: '➕' },
        { path: '/products/categories', label: 'Categories', icon: '🏷️' }
      ]
    },
    {
      path: '/expenses',
      label: 'Expenses',
      icon: '💰',
      isOpen: false,
      children: [
        { path: '/expenses', label: 'All Expenses', icon: '💰' },
        { path: '/expenses/new', label: 'Add New', icon: '➕' },
        { path: '/expenses/categories', label: 'Categories', icon: '🏷️' },
        { path: '/expenses/reports', label: 'Reports', icon: '📊' }
      ]
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📈',
      isOpen: false,
      children: [
        { path: '/reports/sales', label: 'Sales', icon: '💹' },
        { path: '/reports/expenses', label: 'Expenses', icon: '📉' },
        { path: '/reports/profit-loss', label: 'Profit & Loss', icon: '📊' },
        { path: '/reports/taxes', label: 'Tax Reports', icon: '🏛️' }
      ]
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: '⚙️',
      isOpen: false,
      children: [
        { path: '/settings/profile', label: 'Profile', icon: '👤' },
        { path: '/settings/company', label: 'Company', icon: '🏢' },
        { path: '/settings/taxes', label: 'Taxes', icon: '🏛️' },
        { path: '/settings/email', label: 'Email', icon: '✉️' },
        { path: '/settings/users', label: 'Users', icon: '👥' },
        { path: '/settings/subscription', label: 'Subscription', icon: '💳' }
      ]
    }
  ]);
  
  constructor() {
    inject(Title).setTitle('Small Business - Track Invoice Application');
  }
  
  toggleSubmenu(item: NavItem): void {
    item.isOpen = !item.isOpen;
    this.navItems.update(items => [...items]);
  }
  
  hasActiveChild(item: NavItem): boolean {
    return item.children ? item.children.some(child => this.isActive(child)) : false;
  }

  isActive(item: NavItem): boolean {
    return window.location.pathname === item.path;
  }
}
