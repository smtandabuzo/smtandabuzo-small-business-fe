import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[AuthInterceptor] Intercepting ${request.method} request to ${request.url}`);
    
    // Get the auth token and CSRF token from local storage
    const authToken = localStorage.getItem('auth_token');
    const csrfToken = this.getCookie('XSRF-TOKEN');
    
    console.log('[AuthInterceptor] Auth token from storage:', authToken ? 'exists' : 'not found');
    console.log('[AuthInterceptor] CSRF token from cookies:', csrfToken || 'not found');

    // Set up headers
    let headers: { [name: string]: string | string[] } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add auth token if exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add CSRF token for non-GET requests if exists
    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Clone the request with the new headers
    const modifiedReq = request.clone({
      setHeaders: headers,
      withCredentials: true // Important for cookies/session
    });

    return next.handle(modifiedReq);
  }

  // Helper function to get cookie value by name
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
