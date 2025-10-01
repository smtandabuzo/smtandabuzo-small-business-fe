import { inject } from '@angular/core';
import { Router, type CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable, map, of } from 'rxjs';

// Helper function to clean and validate returnUrl
function getValidReturnUrl(returnUrl: string | null): string | null {
  if (!returnUrl) return null;
  
  // Prevent redirect loops by checking for existing returnUrl in the path
  if (returnUrl.includes('returnUrl=')) {
    const url = new URL(returnUrl, 'http://dummy.com');
    if (url.searchParams.has('returnUrl')) {
      return null; // Already has a returnUrl, prevent nesting
    }
  }
  
  // Only allow relative URLs for security
  if (returnUrl.startsWith('http')) {
    return null;
  }
  
  return returnUrl;
}

export function redirectToLogin(url: string): string {
  // Store the attempted URL for redirecting after login
  const authService = inject(AuthService);
  authService.redirectUrl = url;

  // Return the login URL with the redirect URL
  const returnUrl = `/auth/login?redirectTo=${encodeURIComponent(url)}`;
  console.log('[AuthGuard] Redirecting to login with return URL:', returnUrl);
  return returnUrl;
}

export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }
      
      // Not logged in, redirect to login page with the return URL
      const returnUrl = state.url === '/auth/logout' ? '/' : state.url;
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: returnUrl } 
      });
      return false;
    })
  );
};
