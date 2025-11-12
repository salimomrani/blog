import {
  ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, inject,
  provideAppInitializer
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideMarkdown } from 'ngx-markdown';
import { Store } from '@ngrx/store';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { forbiddenInterceptor } from './interceptors/forbidden.interceptor';
import { tokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';
import { authReducer } from './store/auth';
import { AuthEffects } from './store/auth';
import * as authActions from './store/auth/auth.actions';

/**
 * Initialize authentication before app starts
 * Loads tokens from storage and dispatches loadUserProfile if token exists
 */
export function initializeAuth() {
  return () => {
    const store = inject(Store);
    store.dispatch(authActions.initializeAuth());
    store.dispatch(authActions.loadUserProfile());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, forbiddenInterceptor, tokenRefreshInterceptor])),
    provideStore({
      auth: authReducer
    }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideMarkdown(),
    provideAppInitializer(initializeAuth()),
  ]
};
