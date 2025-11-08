import {
  ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, inject,
  provideAppInitializer
} from '@angular/core';
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
import { noop } from 'rxjs';

/**
 * Initialize authentication before app starts
 * Actively calls /me API to load user profile on page refresh
 * This ensures all guards and services have correct auth state before navigation
 */
export function initializeAuth() {
  return () => {
    const authStore = inject(AuthStore);
    return authStore.loadUserProfile().toPromise().catch(() => noop);
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
    provideAppInitializer(initializeAuth()),

  ]
};
