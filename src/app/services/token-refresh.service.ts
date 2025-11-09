import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Service to manage token refresh state using Angular Signals
 * Provides centralized state for token refresh operations across the app
 */
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  // Signal to track if a token refresh is currently in progress
  private readonly isRefreshingSignal = signal<boolean>(false);

  // Subject to emit the refreshed token to waiting requests
  private readonly refreshedTokenSubject = new Subject<string>();

  /**
   * Observable that emits when a new token is available
   * Used by concurrent requests to wait for the refresh to complete
   */
  public readonly refreshedToken$: Observable<string> = this.refreshedTokenSubject.asObservable();

  /**
   * Computed signal that exposes the refreshing state
   */
  public readonly isRefreshing = computed(() => this.isRefreshingSignal());

  /**
   * Start a token refresh operation
   */
  public startRefreshing(): void {
    this.isRefreshingSignal.set(true);
  }

  /**
   * Complete a token refresh operation successfully
   * @param newToken - The new access token
   */
  public completeRefresh(newToken: string): void {
    this.isRefreshingSignal.set(false);
    this.refreshedTokenSubject.next(newToken);
  }

  /**
   * Mark token refresh as failed
   */
  public failRefresh(): void {
    this.isRefreshingSignal.set(false);
  }

  /**
   * Get the current refreshing state value (non-reactive)
   */
  public isCurrentlyRefreshing(): boolean {
    return this.isRefreshingSignal();
  }
}
