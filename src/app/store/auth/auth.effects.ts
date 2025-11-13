import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { AnalyticsService } from '../../services/analytics.service';
import * as authActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private readonly analyticsService = inject(AnalyticsService);

  // Initialize Auth - Load tokens from storage
  initializeAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.initializeAuth),
      map(() => {
        const accessToken = this.storageService.getAccessToken();
        const refreshToken = this.storageService.getRefreshToken();

        if (accessToken) {
          return authActions.updateTokens({ accessToken, refreshToken: refreshToken || '' });
        }

        return authActions.clearError();
      })
    )
  );

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map((response) => {
            if (!response.success) {
              throw new Error(response.message);
            }

            const { accessToken, refreshToken, user } = response.data;

            // Save tokens to localStorage
            this.storageService.setAccessToken(accessToken);
            if (refreshToken) {
              this.storageService.setRefreshToken(refreshToken);
            }

            return authActions.loginSuccess({
              accessToken,
              refreshToken: refreshToken ?? null,
              user
            });
          }),
          catchError((error) => {
            this.storageService.clearTokens();
            const errorMessage = error?.error?.message ?? error?.message ?? 'Login failed';
            return of(authActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Register Effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.register),
      switchMap(({ payload }) =>
        this.authService.register(payload).pipe(
          map((response) => {
            if (!response.success) {
              throw new Error(response.message);
            }

            const { accessToken, refreshToken, user } = response.data;

            // Save tokens to localStorage
            this.storageService.setAccessToken(accessToken);
            if (refreshToken) {
              this.storageService.setRefreshToken(refreshToken);
            }

            return authActions.registerSuccess({
              accessToken,
              refreshToken: refreshToken ?? null,
              user
            });
          }),
          catchError((error) => {
            this.storageService.clearTokens();
            const errorMessage = error?.error?.message ?? error?.message ?? 'Registration failed';
            return of(authActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => {
            // Clear tokens from localStorage
            this.storageService.clearTokens();
            return authActions.logoutSuccess();
          }),
          catchError((error) => {
            // Clear tokens even if API call fails
            this.storageService.clearTokens();
            const errorMessage = error?.message ?? 'Logout failed';
            return of(authActions.logoutFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Load User Profile Effect
  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.loadUserProfile),
      switchMap(() =>
        this.authService.me().pipe(
          map((response) => {
            if (!response.success) {
              throw new Error(response.message);
            }
            return authActions.loadUserProfileSuccess({ user: response.data });
          }),
          catchError((error) => {
            // If user profile fails to load, clear tokens (likely expired)
            this.storageService.clearTokens();
            const errorMessage = error?.error?.message ?? error?.message ?? 'Session expired';
            return of(authActions.loadUserProfileFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Redirect after successful login
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.loginSuccess),
        tap(() => {
          this.analyticsService.trackLogin('email');
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );

  // Redirect after successful registration
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.registerSuccess),
        tap(() => {
          this.analyticsService.trackSignUp('email');
          this.router.navigate(['/home']);
        })
      ),
    { dispatch: false }
  );

  // Redirect after logout
  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authActions.logoutSuccess, authActions.logoutFailure),
        tap(() => {
          this.analyticsService.trackLogout();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}
