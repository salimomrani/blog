import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { computed } from '@angular/core';
import { AuthService, UserDto, RegisterRequestDto, ApiResponseAuthResponse, ApiResponseUserDto } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize state with tokens from localStorage
function getInitialState(): AuthState {
  const storageService = inject(StorageService);
  return {
    user: null,
    accessToken: storageService.getAccessToken(),
    refreshToken: storageService.getRefreshToken(),
    isLoading: false,
    error: null
  };
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(getInitialState),
  withComputed((state) => ({
    isAuthenticated: computed(() => !!state.accessToken()),
    fullName: computed(() => state.user()?.fullName ?? null),
    firstName: computed(() => state.user()?.firstName ?? null)
  })),
  withMethods((store, authService = inject(AuthService), storageService = inject(StorageService)) => ({
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) => authService.login(credentials).pipe(
          tap((response: ApiResponseAuthResponse) => {
            if (!response.success) {
              throw new Error(response.message);
            }

            const { accessToken, refreshToken, user } = response.data;

            // Save tokens to localStorage
            storageService.setAccessToken(accessToken);
            if (refreshToken) {
              storageService.setRefreshToken(refreshToken);
            }

            // Update store state with user data directly from login response
            patchState(store, {
              accessToken,
              refreshToken: refreshToken ?? null,
              user,
              isLoading: false
            });
          }),
          catchError((error) => {
            storageService.clearTokens();
            const errorMessage = error?.error?.message ?? error?.message ?? 'Login failed';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    register: rxMethod<RegisterRequestDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) => authService.register(payload).pipe(
          tap((response: ApiResponseAuthResponse) => {
            if (!response.success) {
              throw new Error(response.message);
            }

            const { accessToken, refreshToken, user } = response.data;

            // Save tokens to localStorage
            storageService.setAccessToken(accessToken);
            if (refreshToken) {
              storageService.setRefreshToken(refreshToken);
            }

            // Update store state with user data directly from register response
            patchState(store, {
              accessToken,
              refreshToken: refreshToken ?? null,
              user,
              isLoading: false
            });
          }),
          catchError((error) => {
            storageService.clearTokens();
            const errorMessage = error?.error?.message ?? error?.message ?? 'Registration failed';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    logout(): Observable<void> {
      patchState(store, { isLoading: true, error: null });
      return authService.logout().pipe(
        tap(() => {
          // Clear tokens from localStorage
          storageService.clearTokens();

          // Clear store state
          patchState(store, { user: null, accessToken: null, refreshToken: null, isLoading: false });
        }),
        catchError((error) => {
          // Clear tokens even if API call fails
          storageService.clearTokens();
          patchState(store, {
            error: error?.message ?? 'Logout failed',
            isLoading: false,
            user: null,
            accessToken: null,
            refreshToken: null
          });
          return EMPTY;
        })
      );
    },

    /**
     * Load user profile if token exists (on app init)
     */
    loadUserProfile(): void {
      const token = store.accessToken();
      if (!token) {
        return;
      }

      patchState(store, { isLoading: true, error: null });
      authService.me().pipe(
        tap((response: ApiResponseUserDto) => {
          if (!response.success) {
            throw new Error(response.message);
          }
          patchState(store, { user: response.data, isLoading: false });
        }),
        catchError((error) => {
          // If user profile fails to load, clear tokens (likely expired)
          storageService.clearTokens();
          const errorMessage = error?.error?.message ?? error?.message ?? 'Session expired';
          patchState(store, {
            error: errorMessage,
            isLoading: false,
            user: null,
            accessToken: null,
            refreshToken: null
          });
          return EMPTY;
        })
      ).subscribe();
    }
  })),
  withHooks({
    onInit(store) {
      // Defer profile loading to avoid circular dependency
      // Store is fully initialized at this point, but we need to wait for the microtask queue
      queueMicrotask(() => {
        if (store.accessToken()) {
          store.loadUserProfile();
        }
      });
    }
  })
);

