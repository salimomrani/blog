import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthFacade } from '../../../store/auth/auth.facade';

/**
 * Component for displaying and managing article likes
 * Shows the number of likes and allows authenticated users to like/unlike articles
 * Non-authenticated users can only view the like count
 */
@Component({
  selector: 'app-article-like-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-like-button.component.html',
  styleUrl: './article-like-button.component.scss'
})
export class ArticleLikeButtonComponent {
  protected readonly store = inject(ArticlesStore);
  protected readonly authFacade = inject(AuthFacade);

  // Signal version of auth state (converted from observable)
  protected readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$, { initialValue: false });

  /**
   * The ID of the article
   */
  public readonly articleId = input.required<number>();

  /**
   * The number of likes
   */
  public readonly likesCount = input.required<number>();

  /**
   * Whether the current user has liked this article
   */
  public readonly isLiked = input.required<boolean>();

  /**
   * Toggle like/unlike for this article
   * Only works for authenticated users
   */
  protected onToggleLike(): void {
    if (this.isAuthenticated()) {
      this.store.toggleLike(this.articleId());
    }
  }
}
