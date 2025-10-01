import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-gray-900">Small Business</h1>
          <p class="mt-2 text-sm text-gray-600">Track Invoice Application</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent { }
