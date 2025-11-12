import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectIsAdmin } from '../store/auth';

/**
 * Guard to restrict access to admin users only
 * Note: Auth is guaranteed to be loaded via APP_INITIALIZER before navigation starts
 */
export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectIsAdmin).pipe(
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }

      // Redirect to home if not admin
      return router.createUrlTree(['/home'], {
        queryParams: {
          error: 'access-denied',
          message: 'Accès réservé aux administrateurs'
        }
      });
    })
  );
};
