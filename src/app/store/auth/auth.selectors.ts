import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Feature selector
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Basic selectors
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectAccessToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.accessToken
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// Computed selectors
export const selectIsAuthenticated = createSelector(
  selectAccessToken,
  (token: string | null) => !!token
);

export const selectIsAdmin = createSelector(
  selectUser,
  (user) => user?.role === 'ADMIN'
);

export const selectFullName = createSelector(
  selectUser,
  (user) => user?.fullName ?? null
);

export const selectFirstName = createSelector(
  selectUser,
  (user) => user?.firstName ?? null
);

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id ?? null
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email ?? null
);
