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

    // Subscribe to isLoggedIn$ to wait for auth state update
    const authStateSub = this.authService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn === true),
      take(1),
      timeout(5000) // 5 second timeout in case something goes wrong
    ).subscribe({
      next: () => {
        console.log('[Login] Auth state updated - user is logged in');
        this.handleSuccessfulLogin();
      },
      error: (err) => {
        console.error('[Login] Error waiting for auth state update:', err);
        this.handleSuccessfulLogin(); // Still try to proceed
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
    
    // Determine the redirect URL in order of preference:
    // 1. URL from query parameters (if valid)
    // 2. URL from auth service (if any)
    // 3. Default to '/dashboard'
    let redirectUrl = '/dashboard';
    
    if (this.returnUrl && !this.returnUrl.includes('login')) {
      redirectUrl = this.returnUrl;
    } else if (this.authService.redirectUrl) {
      redirectUrl = this.authService.redirectUrl;
    }
    
    console.log('Redirecting to:', redirectUrl);
    
    // Clear the redirect URL before navigation
    this.authService.redirectUrl = null;
    
    // Navigate to the target URL
    this.router.navigateByUrl(redirectUrl, { 
      replaceUrl: true 
    }).then(success => {
      console.log('Navigation success:', success);
      if (!success) {
        console.log('Navigation failed, falling back to dashboard');
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    }).catch(err => {
      console.error('Navigation error, falling back to dashboard:', err);
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    });
  }
}
