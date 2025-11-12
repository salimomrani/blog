import { createReducer, on } from '@ngrx/store';
import { UserDto } from '../../services/auth.service';
import * as authActions from './auth.actions';

export interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,

  // Initialize Auth
  on(authActions.initializeAuth, (state) => ({
    ...state
  })),

  // Login
  on(authActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(authActions.loginSuccess, (state, { accessToken, refreshToken, user }) => ({
    ...state,
    accessToken,
    refreshToken,
    user,
    isLoading: false,
    error: null
  })),

  on(authActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    user: null,
    accessToken: null,
    refreshToken: null
  })),

  // Register
  on(authActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(authActions.registerSuccess, (state, { accessToken, refreshToken, user }) => ({
    ...state,
    accessToken,
    refreshToken,
    user,
    isLoading: false,
    error: null
  })),

  on(authActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    user: null,
    accessToken: null,
    refreshToken: null
  })),

  // Logout
  on(authActions.logout, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(authActions.logoutSuccess, () => ({
    ...initialState
  })),

  on(authActions.logoutFailure, (state, { error }) => ({
    ...initialState,
    error
  })),

  // Load User Profile
  on(authActions.loadUserProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(authActions.loadUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),

  on(authActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    user: null,
    accessToken: null,
    refreshToken: null
  })),

  // Update Tokens
  on(authActions.updateTokens, (state, { accessToken, refreshToken }) => ({
    ...state,
    accessToken,
    refreshToken
  })),

  // Clear Error
  on(authActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);
