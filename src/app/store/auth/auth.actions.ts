import { createAction, props } from '@ngrx/store';
import { UserDto, RegisterRequestDto } from '../../services/auth.service';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ accessToken: string; refreshToken: string | null; user: UserDto }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ payload: RegisterRequestDto }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ accessToken: string; refreshToken: string | null; user: UserDto }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// Load User Profile Actions
export const loadUserProfile = createAction('[Auth] Load User Profile');

export const loadUserProfileSuccess = createAction(
  '[Auth] Load User Profile Success',
  props<{ user: UserDto }>()
);

export const loadUserProfileFailure = createAction(
  '[Auth] Load User Profile Failure',
  props<{ error: string }>()
);

// Update Tokens Action (used by token refresh interceptor)
export const updateTokens = createAction(
  '[Auth] Update Tokens',
  props<{ accessToken: string; refreshToken: string }>()
);

// Clear Error Action
export const clearError = createAction('[Auth] Clear Error');

// Initialize Auth (load tokens from storage)
export const initializeAuth = createAction('[Auth] Initialize');
