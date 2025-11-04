import { Pipe, PipeTransform, inject } from '@angular/core';
import { AuthStore } from '../../store/auth.store';
import { ArticleDto } from '../../models/article.model';

/**
 * Pipe to check if the current authenticated user is the author of an article
 *
 * Usage: article | isAuthor
 * Returns: boolean - true if current user is the article author
 */
@Pipe({
  name: 'isAuthor',
  standalone: true,
  pure: true
})
export class IsAuthorPipe implements PipeTransform {
  private readonly authStore = inject(AuthStore);

  public transform(article: ArticleDto | null): boolean {
    if (!article) {
      return false;
    }

    const user = this.authStore.user();
    if (!user) {
      return false;
    }

    return article.author.id === user.id;
  }
}
