# Auth Store - NgRx Implementation

This directory contains the authentication store implementation using **NgRx** with the traditional pattern (actions, reducers, effects, selectors).

## 📁 Structure

```
src/app/store/auth/
├── auth.actions.ts      # Action definitions
├── auth.reducer.ts      # State management with reducers
├── auth.effects.ts      # Side effects handling
├── auth.selectors.ts    # State selectors
├── auth.facade.ts       # Simplified API for components
├── index.ts             # Public exports
└── README.md            # This file
```

## 🎯 Architecture Pattern

This implementation follows the **Redux pattern** with NgRx:

1. **Actions** → Define what happened
2. **Reducers** → Update state based on actions
3. **Effects** → Handle side effects (API calls, routing, storage)
4. **Selectors** → Query the state
5. **Facade** → Simplified API layer for components

## 📦 Actions (auth.actions.ts)

All authentication-related actions:

### Login Actions
- `login` - Initiate login
- `loginSuccess` - Login successful
- `loginFailure` - Login failed

### Register Actions
- `register` - Initiate registration
- `registerSuccess` - Registration successful
- `registerFailure` - Registration failed

### Logout Actions
- `logout` - Initiate logout
- `logoutSuccess` - Logout successful
- `logoutFailure` - Logout failed

### Profile Actions
- `loadUserProfile` - Load user profile
- `loadUserProfileSuccess` - Profile loaded
- `loadUserProfileFailure` - Profile loading failed

### Other Actions
- `updateTokens` - Update access/refresh tokens
- `clearError` - Clear error state
- `initializeAuth` - Initialize auth on app start

## 🔄 Reducer (auth.reducer.ts)

### State Interface

```typescript
interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### Responsibilities
- Manage authentication state
- Handle action responses
- Maintain loading and error states
- Reset state on logout

## ⚡ Effects (auth.effects.ts)

### Side Effects Handled
- **Login/Register** → API calls + token storage
- **Logout** → API call + clear storage
- **Load Profile** → API call + error handling
- **Navigation** → Redirect after login/logout
- **Token Management** → Load from storage on init

### Dependencies
- `AuthService` - HTTP operations
- `StorageService` - Token persistence
- `Router` - Navigation

## 🎯 Selectors (auth.selectors.ts)

### Available Selectors

```typescript
selectUser              // Current user
selectAccessToken       // Access token
selectRefreshToken      // Refresh token
selectIsLoading         // Loading state
selectError             // Error message
selectIsAuthenticated   // Authentication status (computed)
selectIsAdmin           // Admin role check (computed)
selectFullName          // User full name (computed)
selectFirstName         // User first name (computed)
selectUserId            // User ID (computed)
selectUserEmail         // User email (computed)
```

## 🎨 Facade (auth.facade.ts)

### Purpose
Provides a **simplified API** for components to interact with the auth store without needing to know about actions/selectors.

### Usage in Components

```typescript
import { AuthFacade } from '@store/auth';

export class MyComponent {
  private readonly authFacade = inject(AuthFacade);

  // Access state via Observables
  readonly user$ = this.authFacade.user$;
  readonly isLoading$ = this.authFacade.isLoading$;
  readonly error$ = this.authFacade.error$;
  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;

  // Dispatch actions via methods
  login() {
    this.authFacade.login('email@example.com', 'password');
  }

  logout() {
    this.authFacade.logout();
  }
}
```

### Template with Async Pipe

```html
@if (error$ | async; as error) {
  <div class="error">{{ error }}</div>
}

<button [disabled]="isLoading$ | async">
  @if (isLoading$ | async) {
    Loading...
  } @else {
    Login
  }
</button>
```

## 🔧 Configuration (app.config.ts)

The auth store is registered in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      auth: authReducer
    }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ /* ... */ }),
    provideAppInitializer(initializeAuth())
  ]
};
```

## 🚀 Benefits of This Architecture

### ✅ Separation of Concerns
- **Actions** → What happened
- **Reducers** → How state changes
- **Effects** → Side effects isolation
- **Selectors** → Memoized state queries
- **Facade** → Clean component API

### ✅ Testability
- Pure functions (reducers)
- Isolated side effects (effects)
- Easy to mock (facade)

### ✅ Debugging
- Redux DevTools integration
- Time-travel debugging
- Action history
- State inspection

### ✅ Scalability
- Predictable state management
- Easy to add new actions/effects
- Composable selectors

## 📝 Migration Example

### Before (SignalStore)

```typescript
export class LoginComponent {
  readonly authStore = inject(AuthStore);

  login() {
    this.authStore.login({ email, password });
  }
}
```

```html
@if (authStore.error()) {
  <div>{{ authStore.error() }}</div>
}

<button [disabled]="authStore.isLoading()">Login</button>
```

### After (NgRx + Facade)

```typescript
export class LoginComponent {
  private readonly authFacade = inject(AuthFacade);

  readonly error$ = this.authFacade.error$;
  readonly isLoading$ = this.authFacade.isLoading$;

  login() {
    this.authFacade.login(email, password);
  }
}
```

```html
@if (error$ | async; as error) {
  <div>{{ error }}</div>
}

<button [disabled]="isLoading$ | async">Login</button>
```

## 🔐 Security Features

- Tokens stored in `localStorage` via `StorageService`
- Automatic token refresh via interceptor
- Profile loaded on app init if tokens exist
- Logout clears all auth data
- Failed profile load triggers logout

## 🛠️ Development Tools

### Redux DevTools
Open Redux DevTools in Chrome to:
- Inspect actions
- View state changes
- Time-travel debug
- Export/import state

## 📚 Next Steps

To complete the migration:
1. ✅ Migrate `LoginComponent` (done)
2. ⏳ Migrate `RegisterComponent`
3. ⏳ Update all components using `AuthStore`
4. ⏳ Update guards and interceptors
5. ⏳ Remove old `auth.store.ts` file
6. ⏳ Update tests

## 💡 Tips

1. **Always use AuthFacade** in components (not Store directly)
2. **Use async pipe** in templates for automatic subscription management
3. **Check Redux DevTools** for debugging state issues
4. **Effects handle side effects** - keep reducers pure
5. **Selectors are memoized** - use them freely

## 🐛 Common Issues

### Issue: Effects not firing
**Solution:** Ensure `provideEffects([AuthEffects])` is in `app.config.ts`

### Issue: State not updating in component
**Solution:** Use `async` pipe or subscribe to observables

### Issue: Redirect not working
**Solution:** Check `AuthEffects` redirect effects (loginSuccess$, logoutSuccess$)

---

**Author:** NgRx Architecture Migration
**Date:** 2025
**Pattern:** Redux with NgRx
