import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
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

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        console.log('Login successful, response:', response);
        this.isLoading = false;
        
        // Wait for the auth state to update
        setTimeout(() => {
          // Get the redirect URL from auth service or default to dashboard
          const redirectUrl = this.authService.redirectUrl || '/dashboard';
          console.log('Redirecting to:', redirectUrl);
          
          // Navigate to the target URL
          this.router.navigateByUrl(redirectUrl, { replaceUrl: true })
            .then(success => {
              console.log('Navigation success:', success);
              // Clear the redirect URL after successful navigation
              if (success) {
                this.authService.redirectUrl = null;
              }
            })
            .catch(err => {
              console.error('Navigation error:', err);
              // If navigation fails, fall back to dashboard
              this.router.navigate(['/dashboard']);
            });
        }, 100);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid username or password';
      },
      complete: () => {
        console.log('Login observable completed');
      }
    });
  }
}
