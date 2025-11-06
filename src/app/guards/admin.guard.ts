import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

/**
 * Guard to restrict access to admin users only
 */
export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAdmin()) {
    return true;
  }

  // Redirect to home if not admin
  return router.createUrlTree(['/home'], {
    queryParams: {
      error: 'access-denied',
      message: 'Accès réservé aux administrateurs'
    }
  });
};
