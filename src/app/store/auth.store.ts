import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { AuthService, AuthResponseDto, UserProfileDto } from '../services/auth.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, EMPTY, pipe } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface AuthState {
  user: UserProfileDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed((state) => ({
    isAuthenticated: computed(() => !!state.accessToken()),
    username: computed(() => state.user()?.username ?? null)
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    login: rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((credentials) => authService.login(credentials).pipe(
          tap((res: AuthResponseDto) => patchState(store, {
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken ?? null
          })),
          tap((res: AuthResponseDto) => {
            try {
              localStorage.setItem('accessToken', res.data.accessToken);
              if (res.data.refreshToken) {
                localStorage.setItem('refreshToken', res.data.refreshToken);
              }
            } catch {}
          }),
          switchMap(() => authService.me()),
          tap((user: UserProfileDto) => patchState(store, { user, isLoading: false })),
          catchError((error) => {
            patchState(store, { error: error?.message ?? 'Login failed', isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    logout(): Observable<void> {
      patchState(store, { isLoading: true, error: null });
      return authService.logout().pipe(
        tap(() => patchState(store, { user: null, accessToken: null, refreshToken: null, isLoading: false })),
        tap(() => {
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          } catch {}
        }),
        catchError((error) => {
          patchState(store, { error: error?.message ?? 'Logout failed', isLoading: false, user: null, accessToken: null, refreshToken: null });
          return EMPTY;
        })
      );
    }
  }))
);


