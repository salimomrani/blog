import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { forbiddenInterceptor } from './interceptors/forbidden.interceptor';
import { AuthStore } from './store/auth.store';

/**
 * Initialize authentication before app starts
 * Actively calls /me API to load user profile on page refresh
 * This ensures all guards and services have correct auth state before navigation
 */
function initializeAuth(): () => Promise<void> {
  return () => {
    const authStore = inject(AuthStore);

    // Call /me API to load authenticated user profile
    return new Promise<void>((resolve) => {
      authStore.loadUserProfile().subscribe({
        complete: () => resolve(),
        error: () => resolve() // Resolve even on error to let app continue
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, unauthorizedInterceptor, forbiddenInterceptor])),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true
    }
  ]
};
