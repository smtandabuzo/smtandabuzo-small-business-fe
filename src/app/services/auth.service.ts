import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SignUpRequest, AuthResponse, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Use relative URL since we're using a proxy
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private currentUserSubject: BehaviorSubject<User | null>;
  redirectUrl: string | null = null;

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

  // Get the current authentication token
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('[AuthService] Retrieved token from localStorage:', token ? 'Token exists' : 'No token found');
    return token;
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials).pipe(
      tap({
        next: (response: any) => {
          if (response && response.token) {
            this.storeAuthData(response);
            this.isLoggedInSubject.next(true);
            // Store the user data in the behavior subject
            if (response.user) {
              this.currentUserSubject.next(response.user);
            }
            // Navigate to the return URL if available, or to the dashboard
            const returnUrl = this.redirectUrl || '/dashboard';
            this.router.navigateByUrl(returnUrl);
          } else {
            console.error('[AuthService] No token in login response');
            throw new Error('No authentication token received');
          }
        },
        error: (error) => {
          console.error('[AuthService] Login error:', error);
          this.clearAuthData();
          throw error;
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
          this.storeAuthData(response);
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        this.clearAuthData();
        throw error;
      })
    );
  }

  private storeAuthData(authData: any): void {
    console.log('[AuthService] Storing auth data in localStorage');
    // Store the token from either accessToken or token field
    const token = authData.accessToken || authData.token;
    if (!token) {
      console.error('[AuthService] No token found in auth response');
      throw new Error('No authentication token received from server');
    }
    localStorage.setItem('auth_token', token);
    console.log('[AuthService] Token stored in localStorage');

    if (authData.refreshToken) {
      localStorage.setItem('refresh_token', authData.refreshToken);
    }
    const userData = authData.user || {};
    localStorage.setItem('user', JSON.stringify(userData));

    // Update both subjects and ensure they're in sync
    this.currentUserSubject.next(userData);
    this.isLoggedInSubject.next(true);

    console.log('[AuthService] Auth state updated - isLoggedIn:', true, 'user:', userData);
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
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
    if (!roles || roles.length === 0) return true;
    const user = this.getCurrentUser();
    return (user?.roles?.some(role => roles.includes(role))) ?? false;
  }
}
