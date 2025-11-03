import { Injectable } from '@angular/core';

/**
 * Service to handle secure storage operations in localStorage
 * Provides type-safe methods to store and retrieve authentication tokens
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  /**
   * Store access token in localStorage
   */
  public setAccessToken(token: string): void {
    try {
      localStorage.setItem(this.accessTokenKey, token);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  /**
   * Retrieve access token from localStorage
   */
  public getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.accessTokenKey);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Store refresh token in localStorage
   */
  public setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.refreshTokenKey, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Retrieve refresh token from localStorage
   */
  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Remove access token from localStorage
   */
  public removeAccessToken(): void {
    try {
      localStorage.removeItem(this.accessTokenKey);
    } catch (error) {
      console.error('Failed to remove access token:', error);
    }
  }

  /**
   * Remove refresh token from localStorage
   */
  public removeRefreshToken(): void {
    try {
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  }

  /**
   * Clear all tokens from localStorage
   */
  public clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }
}
