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
import {
  NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN,
  NGX_GOOGLE_ANALYTICS_INITIALIZER_PROVIDER
} from 'ngx-google-analytics';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { forbiddenInterceptor } from './interceptors/forbidden.interceptor';
import { tokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';
import { authReducer } from './store/auth';
import { AuthEffects } from './store/auth';
import { StorageService } from './services/storage.service';
import * as authActions from './store/auth/auth.actions';

/**
 * Initialize authentication before app starts
 * Loads tokens from storage and dispatches loadUserProfile only if token exists
 */
export function initializeAuth() {
  return () => {
    const store = inject(Store);
    const storageService = inject(StorageService);

    // Always dispatch initializeAuth to load tokens from storage
    store.dispatch(authActions.initializeAuth());

    // Only load user profile if we have an access token
    // This avoids unnecessary API calls on auth routes or when user is logged out
    const accessToken = storageService.getAccessToken();
    if (accessToken) {
      store.dispatch(authActions.loadUserProfile());
    }
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
    // Google Analytics 4 - only enabled if Measurement ID is configured
    ...(environment.googleAnalyticsId ? [
      {
        provide: NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN,
        useValue: {
          trackingCode: environment.googleAnalyticsId,
          isEnabled: true
        }
      },
      NGX_GOOGLE_ANALYTICS_INITIALIZER_PROVIDER
    ] : [])
  ]
};
