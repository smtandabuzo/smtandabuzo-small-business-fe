import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[AuthInterceptor] Intercepting ${request.method} request to ${request.url}`);
    // Get the auth token from local storage
    const authToken = localStorage.getItem('auth_token');
    console.log('[AuthInterceptor] Auth token from storage:', authToken ? 'exists' : 'not found');

    // Clone the request and add the authorization header if token exists
    if (authToken) {
      const authReq = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('[AuthInterceptor] Added Authorization header to request');
      return next.handle(authReq);
    }

    // If no token, proceed with the original request
    return next.handle(request);
  }
}
