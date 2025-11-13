import { Injectable, inject } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

/**
 * Service to handle Google Analytics tracking
 * Provides methods to track custom events and user interactions
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly gaService = inject(GoogleAnalyticsService);

  /**
   * Track user login event
   */
  public trackLogin(method: 'email'): void {
    this.gaService.event('login', 'authentication', method);
  }

  /**
   * Track user registration event
   */
  public trackSignUp(method: 'email'): void {
    this.gaService.event('sign_up', 'authentication', method);
  }

  /**
   * Track user logout event
   */
  public trackLogout(): void {
    this.gaService.event('logout', 'authentication');
  }

  /**
   * Track article creation
   */
  public trackArticleCreate(articleId: number, title: string): void {
    this.gaService.event('article_create', 'content', `${articleId}:${title}`);
  }

  /**
   * Track article view
   */
  public trackArticleView(articleId: number, title: string): void {
    this.gaService.event('article_view', 'content', `${articleId}:${title}`);
  }

  /**
   * Track article like
   */
  public trackArticleLike(articleId: number): void {
    this.gaService.event('article_like', 'engagement', String(articleId));
  }

  /**
   * Track article unlike
   */
  public trackArticleUnlike(articleId: number): void {
    this.gaService.event('article_unlike', 'engagement', String(articleId));
  }

  /**
   * Track comment creation
   */
  public trackCommentCreate(articleId: number, commentId: number): void {
    this.gaService.event('comment_create', 'engagement', `${articleId}:${commentId}`);
  }

  /**
   * Track article search
   */
  public trackSearch(searchTerm: string): void {
    this.gaService.event('search', 'engagement', searchTerm);
  }

  /**
   * Track user profile update
   */
  public trackProfileUpdate(): void {
    this.gaService.event('profile_update', 'user_profile');
  }

  /**
   * Track custom event
   */
  public trackEvent(eventName: string, category = 'engagement', label?: string): void {
    this.gaService.event(eventName, category, label);
  }
}
