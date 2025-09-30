import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SignUpRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Use relative URL since we're using a proxy
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticated.next(true);
    }
  }

  signUp(signUpData: SignUpRequest): Observable<AuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true // This is important for sending/receiving cookies
    };

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/signup`, 
      signUpData,
      httpOptions
    ).pipe(
      tap(response => {
        if (response.token) {
          this.storeAuthToken(response.token);
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  private storeAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticated.next(false);
  }
}
