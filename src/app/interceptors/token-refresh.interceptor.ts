import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

/**
 * Interceptor to handle token refresh on 401 Unauthorized responses
 *
 * When a request fails with 401:
 * 1. Checks if refresh token exists
 * 2. Attempts to refresh the access token
 * 3. Retries the original request with the new token
 * 4. If refresh fails, logs out the user
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  // BehaviorSubject to track if a token refresh is in progress
  const isRefreshing$ = new BehaviorSubject<boolean>(false);
  const refreshedToken$ = new BehaviorSubject<string | null>(null);

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
        authStore.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
        return throwError(() => error);
      }

      const refreshToken = authStore.refreshToken();

      // If no refresh token, logout immediately
      if (!refreshToken) {
        authStore.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
        return throwError(() => error);
      }

      // If already refreshing, wait for the new token
      if (isRefreshing$.value) {
        return refreshedToken$.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            // Retry the request with the new token
            const clonedReq = addTokenToRequest(req, token!);
            return next(clonedReq);
          })
        );
      }

      // Mark as refreshing
      isRefreshing$.next(true);

      // Attempt to refresh the token
      return authService.refresh(refreshToken).pipe(
        switchMap((response) => {
          if (!response.success) {
            throw new Error(response.message);
          }

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update tokens in storage and store
          storageService.setAccessToken(accessToken);
          if (newRefreshToken) {
            storageService.setRefreshToken(newRefreshToken);
          }

          // Update auth store with new tokens
          authStore.updateTokens(accessToken, newRefreshToken ?? refreshToken);

          // Mark refreshing as complete and emit new token
          isRefreshing$.next(false);
          refreshedToken$.next(accessToken);

          // Retry the original request with the new token
          const clonedReq = addTokenToRequest(req, accessToken);
          return next(clonedReq);
        }),
        catchError((refreshError) => {
          // Refresh failed, logout the user
          isRefreshing$.next(false);
          refreshedToken$.next(null);

          authStore.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url, expired: 'true' }
          });

          return throwError(() => refreshError);
        })
      );
    })
  );
};

/**
 * Helper function to add Authorization header to a request
 */
function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      ['Authorization']: `Bearer ${token}`
    }
  });
}
