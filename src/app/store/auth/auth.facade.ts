import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UserDto, RegisterRequestDto } from '../../services/auth.service';
import * as authActions from './auth.actions';
import * as authSelectors from './auth.selectors';

/**
 * Auth Facade Service
 * Provides a simplified API for components to interact with the auth store
 */
@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly store = inject(Store);

  // Selectors as Observables
  readonly user$: Observable<UserDto | null> = this.store.select(authSelectors.selectUser);
  readonly accessToken$: Observable<string | null> = this.store.select(authSelectors.selectAccessToken);
  readonly refreshToken$: Observable<string | null> = this.store.select(authSelectors.selectRefreshToken);
  readonly isLoading$: Observable<boolean> = this.store.select(authSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(authSelectors.selectError);
  readonly isAuthenticated$: Observable<boolean> = this.store.select(authSelectors.selectIsAuthenticated);
  readonly isAdmin$: Observable<boolean> = this.store.select(authSelectors.selectIsAdmin);
  readonly fullName$: Observable<string | null> = this.store.select(authSelectors.selectFullName);
  readonly firstName$: Observable<string | null> = this.store.select(authSelectors.selectFirstName);
  readonly userId$: Observable<number | null> = this.store.select(authSelectors.selectUserId);
  readonly userEmail$: Observable<string | null> = this.store.select(authSelectors.selectUserEmail);

  // Actions
  public login(email: string, password: string): void {
    this.store.dispatch(authActions.login({ email, password }));
  }

  public register(payload: RegisterRequestDto): void {
    this.store.dispatch(authActions.register({ payload }));
  }

  public logout(): void {
    this.store.dispatch(authActions.logout());
  }

  public loadUserProfile(): void {
    this.store.dispatch(authActions.loadUserProfile());
  }

  public updateTokens(accessToken: string, refreshToken: string): void {
    this.store.dispatch(authActions.updateTokens({ accessToken, refreshToken }));
  }

  public clearError(): void {
    this.store.dispatch(authActions.clearError());
  }
}
