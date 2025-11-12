import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ArticleDto } from '../../models/article.model';
import { selectUserId } from '../../store/auth';

/**
 * Pipe to check if the current authenticated user is the author of an article
 *
 * Usage: article | isAuthor
 * Returns: boolean - true if current user is the article author
 *
 * Note: This pipe is impure because it depends on NgRx store state
 */
@Pipe({
  name: 'isAuthor',
  standalone: true,
  pure: false
})
export class IsAuthorPipe implements PipeTransform {
  private readonly store = inject(Store);
  private userId: number | null = null;

  constructor() {
    this.store.select(selectUserId).subscribe(id => {
      this.userId = id;
    });
  }

  public transform(article: ArticleDto | null): boolean {
    if (!article || !this.userId) {
      return false;
    }

    return article.author.id === this.userId;
  }
}
