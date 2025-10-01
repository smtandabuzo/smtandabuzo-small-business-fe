import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <div class="bg-gray-800 text-white w-64 min-h-screen flex-shrink-0">
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-xl font-bold">Small Business</h1>
          <p class="text-gray-400 text-sm">Track Invoice Application</p>
        </div>

        <!-- Navigation -->
        <nav class="mt-6">
          <a *ngFor="let item of navItems"
             [routerLink]="item.path"
             routerLinkActive="bg-gray-900"
             class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
             [routerLinkActiveOptions]="{exact: true}">
            <span class="mr-3">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
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

              <div class="relative">
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
                  (click)="$event.stopPropagation()"
                >
                  <div class="py-1">
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Billing</a>
                    <div class="border-t border-gray-100"></div>
                    <a (click)="onLogout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Sign out</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 py-4">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-gray-500">
              &copy; {{ currentYear }} Small Business - Track Invoice Application. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
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
export class MainLayoutComponent {
  currentYear = new Date().getFullYear();
  isProfileMenuOpen = false;

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/invoices', label: 'Invoices', icon: '📄' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onLogout() {
    this.authService.logout();
    // The auth service will handle the navigation
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.relative')) {
      this.isProfileMenuOpen = false;
    }
  }
}
