import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  console.log('[AuthGuard] Checking authentication for route:', state.url);
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      console.log('[AuthGuard] isLoggedIn:', isLoggedIn);
      
      if (isLoggedIn) {
        // Check if route is restricted by role
        const roles = next.data['roles'] as Array<string>;
        console.log('[AuthGuard] Route requires roles:', roles);
        
        if (roles && roles.length > 0) {
          // Check if user has any of the required roles
          const hasRole = authService.hasAnyRole(roles);
          console.log('[AuthGuard] User has required role:', hasRole);
          
          if (!hasRole) {
            console.log('[AuthGuard] Access denied - insufficient permissions');
            return router.createUrlTree(['/access-denied']);
          }
        }
        
        console.log('[AuthGuard] Access granted');
        return true;
      }

      // Not logged in, redirect to login page with a clean return url
      console.log('[AuthGuard] User not authenticated, redirecting to login');
      
      // Clean and validate the return URL
      const cleanReturnUrl = getValidReturnUrl(state.url);
      
      // Only set redirectUrl if it's a clean URL
      if (cleanReturnUrl) {
        authService.redirectUrl = cleanReturnUrl;
        console.log('[AuthGuard] Stored clean redirect URL:', cleanReturnUrl);
      } else {
        console.log('[AuthGuard] Using default redirect URL (dashboard)');
        authService.redirectUrl = '/dashboard';
      }
      
      // Always redirect to /auth/login without returnUrl to prevent loops
      return router.createUrlTree(['/auth/login']);
    }),
    catchError(error => {
      console.error('[AuthGuard] Error checking authentication:', error);
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
