import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { filter, take, timeout } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true;

  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Get return url from route parameters or default to '/dashboard'
    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl') || '/dashboard';
      console.log('[Login] Return URL from query params:', this.returnUrl);
    });
  }

  onSubmit(): void {
    console.log('Login form submitted');
    if (this.loginForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    console.log('Attempting login with username:', username);

    // Store the subscription to clean it up later
    let authStateSub = this.authService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn === true),
      take(1),
      timeout(10000) // Increased timeout to 10 seconds
    ).subscribe({
      next: () => {
        console.log('[Login] Auth state updated - user is logged in');
        this.handleSuccessfulLogin();
        if (authStateSub) {
          authStateSub.unsubscribe();
        }
      },
      error: (err) => {
        console.error('[Login] Error in auth state update:', err);
        // Even if we get an error, try to proceed with the login
        this.handleSuccessfulLogin();
      }
    });

    // Start the login process
    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        console.log('Login API call successful, waiting for auth state update...');
        // The auth state update will be handled by the auth state subscription above
      },
      error: (error) => {
        console.error('Login error:', error);
        authStateSub.unsubscribe(); // Clean up the subscription
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid username or password';
      },
      complete: () => {
        console.log('Login observable completed');
      }
    });
  }

  private handleSuccessfulLogin(): void {
    console.log('[Login] Handling successful login');
    this.isLoading = false;
    
    // Always use absolute path for navigation
    let redirectUrl = '/dashboard';
    
    // Check for return URL in query params first
    if (this.returnUrl && !this.returnUrl.includes('login') && this.returnUrl !== '/') {
      redirectUrl = this.returnUrl.startsWith('/') ? this.returnUrl : `/${this.returnUrl}`;
      console.log('Using returnUrl from query params:', redirectUrl);
    } 
    // Then check auth service redirect URL
    else if (this.authService.redirectUrl) {
      redirectUrl = this.authService.redirectUrl.startsWith('/') ? 
                   this.authService.redirectUrl : 
                   `/${this.authService.redirectUrl}`;
      console.log('Using redirectUrl from auth service:', redirectUrl);
    }
    
    console.log('Final redirect URL:', redirectUrl);
    
    // Clear the redirect URL before navigation
    this.authService.redirectUrl = null;
    
    // Use a small delay to ensure the auth state is properly updated
    setTimeout(() => {
      console.log('Navigating to:', redirectUrl);
      this.router.navigateByUrl(redirectUrl, { 
        replaceUrl: true 
      }).then(success => {
        console.log('Navigation success:', success);
        if (!success) {
          console.warn('Navigation failed, falling back to /dashboard');
          this.router.navigate(['/dashboard'], { 
            replaceUrl: true,
            queryParamsHandling: 'merge'
          });
        }
      }).catch(error => {
        console.error('Navigation error:', error);
        this.router.navigate(['/dashboard'], { 
          replaceUrl: true,
          queryParamsHandling: 'merge'
        });
      });
    }, 100);
  }
}
