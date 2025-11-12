import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, switchMap, throwError, take, first } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { selectRefreshToken } from '../store/auth';
import * as authActions from '../store/auth/auth.actions';

/**
 * Interceptor to handle token refresh on 401 Unauthorized responses
 *
 * Uses NgRx Store to manage refresh state.
 *
 * When a request fails with 401:
 * 1. Checks if refresh token exists
 * 2. Attempts to refresh the access token
 * 3. Retries the original request with the new token
 * 4. If refresh fails, logs out the user
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const store = inject(Store);
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const tokenRefreshService = inject(TokenRefreshService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Skip token refresh for auth endpoints (login, register, refresh)
      if (req.url.includes('/auth/login') ||
          req.url.includes('/auth/register') ||
          req.url.includes('/auth/refresh')) {
        // For auth endpoints, logout and redirect
        store.dispatch(authActions.logout());
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
        return throwError(() => error);
      }

      return store.select(selectRefreshToken).pipe(
        first(),
        switchMap(refreshToken => {
          // If no refresh token, logout immediately
          if (!refreshToken) {
            store.dispatch(authActions.logout());
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: router.url }
            });
            return throwError(() => error);
          }

          // If already refreshing, wait for the new token
          if (tokenRefreshService.isCurrentlyRefreshing()) {
            return tokenRefreshService.refreshedToken$.pipe(
              take(1),
              switchMap(token => {
                // Retry the request with the new token
                const clonedReq = addTokenToRequest(req, token);
                return next(clonedReq);
              })
            );
          }

          // Mark as refreshing
          tokenRefreshService.startRefreshing();

          // Attempt to refresh the token
          return authService.refresh(refreshToken).pipe(
            switchMap((response) => {
              if (!response.success) {
                throw new Error(response.message);
              }

              const { accessToken, refreshToken: newRefreshToken } = response.data;

              // Update tokens in storage
              storageService.setAccessToken(accessToken);
              if (newRefreshToken) {
                storageService.setRefreshToken(newRefreshToken);
              }

              // Update auth store with new tokens via action
              store.dispatch(authActions.updateTokens({
                accessToken,
                refreshToken: newRefreshToken ?? refreshToken
              }));

              // Mark refreshing as complete and emit new token
              tokenRefreshService.completeRefresh(accessToken);

              // Retry the original request with the new token
              const clonedReq = addTokenToRequest(req, accessToken);
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, mark as failed and logout the user
              tokenRefreshService.failRefresh();

              store.dispatch(authActions.logout());
              router.navigate(['/auth/login'], {
                queryParams: { returnUrl: router.url, expired: 'true' }
              });

              return throwError(() => refreshError);
            })
          );
        })
      );
    })
  );
};

/**
 * Helper function to add Authorization header to a request
 */
export function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      ['Authorization']: `Bearer ${token}`
    }
  });
}
