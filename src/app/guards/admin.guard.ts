import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

/**
 * Guard to restrict access to admin users only
 * Waits for user profile to load on page refresh before checking admin status
 */
export const adminGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // If not authenticated at all, redirect immediately
  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/home'], {
      queryParams: {
        error: 'access-denied',
        message: 'Accès réservé aux administrateurs'
      }
    });
  }

  // Wait for user profile to load if it's loading
  while (authStore.isLoading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Check admin status after loading completes
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
