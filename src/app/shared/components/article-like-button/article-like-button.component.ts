import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesStore } from '../../../store/articles.store';

/**
 * Component for displaying and managing article likes
 * Shows the number of likes and allows users to like/unlike articles
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
   */
  protected onToggleLike(): void {
    this.store.toggleLike(this.articleId());
  }
}
