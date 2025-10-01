import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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

      // Not logged in, redirect to login page with the return url
      console.log('[AuthGuard] User not authenticated, redirecting to login');
      authService.redirectUrl = state.url;
      console.log('[AuthGuard] Stored redirect URL:', state.url);
      
      const urlTree = router.createUrlTree(
        ['/login'], 
        { queryParams: { returnUrl: state.url } }
      );
      
      console.log('[AuthGuard] Created URL tree for login:', urlTree.toString());
      return urlTree;
    }),
    catchError(error => {
      console.error('[AuthGuard] Error checking authentication:', error);
      return of(router.createUrlTree(['/login']));
    })
  );
};
