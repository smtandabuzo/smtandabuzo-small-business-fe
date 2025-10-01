import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[AuthInterceptor] Intercepting ${request.method} request to ${request.url}`);
    
    // Skip adding auth headers for login/register endpoints
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }

    // Get the auth token from the auth service
    const authToken = this.authService.getToken();
    
    if (!authToken) {
      // If no token is available, you might want to redirect to login
      console.warn('No authentication token found');
      // this.router.navigate(['/login']);
      return next.handle(request);
    }

    // Clone the request and add the authorization header
    const authReq = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        // Handle 401 Unauthorized
        if (error.status === 401) {
          // Here you would typically refresh the token or redirect to login
          console.warn('Authentication required - redirecting to login');
          // this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }

  // Helper function to get cookie value by name
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
}
