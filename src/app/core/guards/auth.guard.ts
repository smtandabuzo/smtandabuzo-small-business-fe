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

  // First check if we have a token in local storage
  const token = localStorage.getItem('auth_token');
  console.log('[AuthGuard] Token exists:', !!token);
  
  // If no token, redirect to login
  if (!token) {
    console.log('[AuthGuard] No token found, redirecting to login');
    return of(router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    }));
  }

  // If we have a token, verify the auth state
  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      console.log('[AuthGuard] Auth state - isLoggedIn:', isLoggedIn);
      
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

      // If we have a token but not logged in, try to get user info
      console.log('[AuthGuard] Token exists but not logged in, checking user info...');
      const user = authService.getCurrentUser();
      
      if (user) {
        console.log('[AuthGuard] User info found, updating auth state');
        // Update the current user in the auth service
        (authService as any).currentUserSubject.next(user);
        (authService as any).isLoggedInSubject.next(true);
        return true;
      }

      // If we get here, the token might be invalid
      console.log('[AuthGuard] Token exists but no user info, redirecting to login');
      authService.clearAuthData();
      
      // Store the attempted URL for redirecting after login
      authService.redirectUrl = state.url;
      
      // Redirect to the login page
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }),
    catchError(error => {
      console.error('[AuthGuard] Error checking authentication:', error);
      authService.clearAuthData();
      return of(router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      }));
    })
  );
};
