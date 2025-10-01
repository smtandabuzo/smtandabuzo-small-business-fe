import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SignUpRequest, AuthResponse, User, UserWithPassword, UserCredentials } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Use relative URL since we're using a proxy
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private currentUserSubject: BehaviorSubject<User | null>;
  redirectUrl: string | null = null;

  // Clear authentication data
  clearAuthData = (): void => {
    console.log('[AuthService] Clearing auth data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  };

  constructor(private http: HttpClient, private router: Router) {
    // Initialize subjects with values from localStorage
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!token);
    this.currentUserSubject = new BehaviorSubject<User | null>(user);

    console.log('[AuthService] Initialized with token:', !!token, 'user:', user);
  }

  // Expose the authentication state as an observable
  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  // Get the current user
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Logs out the current user by clearing authentication data
   * and redirecting to the login page
   */

  // Get the current authentication token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Store authentication data in local storage and update current user
  private storeAuthData(authData: { token: string; user: User }): void {
    // Store token in local storage
    localStorage.setItem('auth_token', authData.token);

    // Store user data in local storage
    if (authData.user) {
      localStorage.setItem('user', JSON.stringify(authData.user));
      this.currentUserSubject.next(authData.user);
    }
  }

  login(credentials: UserCredentials): Observable<AuthResponse> {
    // Prepare the request URL - use relative URL with proxy in development
    const url = environment.useProxy
      ? `${environment.apiUrl}/login`  // Proxy will handle the /api prefix
      : `${environment.apiUrl}/auth/login`;  // Full URL in production

    // Prepare the request options
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }),
      withCredentials: environment.useProxy, // Send credentials with CORS in production
      observe: 'response' as const, // This makes it return HttpResponse
      responseType: 'json' as const
    };

    return this.http.post<AuthResponse>(
      url,
      credentials,
      httpOptions
    ).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No response body received');
        }
        return response.body;
      }),
      tap((responseData: AuthResponse) => {
        if (environment.debug) {
          console.log('AuthService - Login successful:', {
            user: {
              id: responseData.id,
              username: responseData.username,
              email: responseData.email,
              roles: responseData.roles
            }
          });
        }

        if (responseData.token) {
          this.storeAuthData({
            token: responseData.token,
            user: {
              id: responseData.id,
              username: responseData.username,
              email: responseData.email,
              roles: responseData.roles || []
            },
          });

          // Navigate to the dashboard or return URL
          const returnUrl = this.redirectUrl || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      }),
      catchError((error: any) => {
        if (environment.debug) {
          console.error('AuthService - Login error:', error);
        }

        let errorMessage = 'Login failed. Please check your credentials.';

        if (!error.status) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Invalid username or password.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (error.status === 403) {
          errorMessage = 'Account not activated. Please check your email.';
        } else if (error.status === 404) {
          errorMessage = 'User not found. Please check your credentials.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  signUp(signUpData: SignUpRequest): Observable<AuthResponse> {
    // Prepare the request URL - use relative URL with proxy in development
    const url = environment.useProxy
      ? `${environment.apiUrl}/signup`  // Proxy will handle the /api prefix
      : `${environment.apiUrl}/auth/signup`;  // Full URL in production

    // Prepare the request options
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }),
      withCredentials: environment.useProxy, // Send credentials with CORS in production
      observe: 'response' as const
    };

    // Prepare the signup payload
    const signupPayload = {
      username: signUpData.username,
      email: signUpData.email,
      password: signUpData.password
    };

    if (environment.debug) {
      console.log('AuthService - Signup request:', {
        url,
        environment: environment.production ? 'production' : 'development',
        useProxy: environment.useProxy,
        payload: { ...signupPayload, password: '***' } // Don't log actual password
      });
    }

    return this.http.post<AuthResponse>(
      url, // Use the constructed URL
      signupPayload,
      { ...httpOptions, observe: 'response' as const }
    ).pipe(
      map(response => {
        const responseData = response.body!; // We know body exists because we got a successful response
        console.log('Signup successful:', responseData);

        if (responseData?.token) {
          // Store the authentication data
          this.storeAuthData({
            token: responseData.token,
            user: {
              id: responseData.id,
              username: responseData.username,
              email: responseData.email,
              roles: responseData.roles || []
            }
          });

          this.isLoggedInSubject.next(true);

          // Create a user object from the response data
          const user: User = {
            id: responseData.id,
            username: responseData.username,
            email: responseData.email,
            roles: responseData.roles || []
          };

          this.currentUserSubject.next(user);
        }
        return responseData; // Return just the AuthResponse
      }),
      catchError((error: any) => {
        console.error('Signup error:', error);
        let errorMessage = 'An error occurred during signup. Please try again.';
          
        if (error) {
          if (error.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
          } else if (error.status === 405) {
            errorMessage = 'Signup is not available. Please contact support.';
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    console.log('[AuthService] Checking if user is logged in');
    const token = localStorage.getItem('auth_token');
    const isAuthenticated = !!token;
    console.log('[AuthService] Token exists:', isAuthenticated);

    // If we have a token but the state doesn't reflect it, update the state
    if (isAuthenticated && !this.isLoggedInSubject.value) {
      console.log('[AuthService] Updating auth state to authenticated');
      this.isLoggedInSubject.next(true);
      const user = this.getCurrentUser();
      if (user) {
        console.log('[AuthService] Found user in localStorage');
        this.currentUserSubject.next(user);
      } else {
        console.log('[AuthService] No user found in localStorage');
      }
    } else if (!isAuthenticated) {
      console.log('[AuthService] No valid token found, user is not authenticated');
    } else {
      console.log('[AuthService] Auth state is already up to date');
    }

    // Return the current authentication state
    return this.isLoggedInSubject.asObservable().pipe(
      tap(isAuth => console.log('[AuthService] Current auth state:', isAuth))
    );
  }

  logout(): void {
    console.log('[AuthService] Logging out');
    this.clearAuthData();
    this.isLoggedInSubject.next(false);
    // Use replaceUrl to prevent going back to protected pages after logout
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return (user?.roles?.includes(role)) ?? false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return true; // If no roles required, allow access
    }
    return roles.some(role => this.hasRole(role));
  }
}
