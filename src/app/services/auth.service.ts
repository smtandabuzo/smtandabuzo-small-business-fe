import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SignUpRequest, AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Use relative URL since we're using a proxy
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Expose the authentication state as an observable
  get isLoggedIn$(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  // Get the current user
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  // Store the URL so we can redirect after logging in
  redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticated.next(true);
    }
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    console.log('[AuthService] Starting login process');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      })
    };

    // Expected login payload format: { "username": "testuser", "password": "password123" }
    const loginData = {
      username: credentials.username,
      password: credentials.password
    };

    console.log('[AuthService] Sending login request to:', `${this.apiUrl}/signin`);
    console.log('[AuthService] Login data:', loginData);

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/signin`,
      loginData,
      httpOptions
    ).pipe(
      tap({
        next: (response: AuthResponse) => {
          console.log('[AuthService] Login successful, response:', response);
          if (response.token && response.user) {
            console.log('[AuthService] Storing auth data');
            this.storeAuthData(response.token, response.user);
            console.log('[AuthService] Updating auth state');
            this.isAuthenticated.next(true);
            this.currentUserSubject.next(response.user);
            console.log('[AuthService] Auth state updated, isAuthenticated:', true);
          } else {
            console.error('[AuthService] Invalid response format, missing token or user');
          }
        },
        error: (error) => {
          console.error('[AuthService] Login error:', error);
          if (error.error) {
            console.error('[AuthService] Error details:', error.error);
          }
          console.log('[AuthService] Clearing auth data due to error');
          this.clearAuthData();
        },
        complete: () => {
          console.log('[AuthService] Login request completed');
        }
      })
    );
  }

  signUp(signUpData: SignUpRequest): Observable<AuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };

    // Expected signup payload format:
    // { "username": "testuser", "email": "test@example.com", "password": "password123", "roles": ["user"] }
    const signupPayload = {
      username: signUpData.username,
      email: signUpData.email,
      password: signUpData.password,
      roles: ['user']  // Default role
    };

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/signup`,
      signupPayload,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.storeAuthData(response.token, response.user);
          this.isAuthenticated.next(true);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        this.clearAuthData();
        throw error;
      })
    );
  }

  private storeAuthData(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.isAuthenticated.next(true);
    this.currentUserSubject.next(user);
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticated.next(false);
    this.currentUserSubject.next(null);
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
    if (isAuthenticated && !this.isAuthenticated.value) {
      console.log('[AuthService] Updating auth state to authenticated');
      this.isAuthenticated.next(true);
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
    return this.isAuthenticated.asObservable().pipe(
      tap(isAuth => console.log('[AuthService] Current auth state:', isAuth))
    );
  }

  logout(redirectToLogin: boolean = true): void {
    // Call your logout API if needed
    this.clearAuthData();
    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return (user?.roles?.includes(role)) ?? false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const user = this.getCurrentUser();
    return (user?.roles?.some(role => roles.includes(role))) ?? false;
  }
}
