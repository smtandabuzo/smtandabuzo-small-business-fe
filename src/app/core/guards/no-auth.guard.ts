import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        // If user is already logged in, redirect to dashboard or return URL
        const returnUrl = state.url.includes('returnUrl=') 
          ? new URLSearchParams(state.url.split('?')[1]).get('returnUrl')
          : null;
        
        if (returnUrl) {
          router.navigateByUrl(returnUrl);
        } else {
          router.navigate(['/dashboard']);
        }
        return false;
      }
      return true;
    })
  );
};
