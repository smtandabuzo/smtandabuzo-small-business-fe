import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class App implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private title = inject(Title);
  private authSubscription: Subscription;

  constructor() {
    // Set the application title
    this.title.setTitle('Small Business - Track Invoice Application');

    // Initialize authentication state
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      const currentUrl = this.router.url;

      if (isLoggedIn) {
        // If user is logged in and tries to access auth pages, redirect to home
        if (currentUrl.startsWith('/auth/')) {
          this.router.navigate(['/dashboard']);
        }
      } else {
        // If user is not logged in and tries to access protected pages, redirect to login
        if (!currentUrl.startsWith('/auth/')) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  ngOnDestroy() {
    // Clean up the subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
