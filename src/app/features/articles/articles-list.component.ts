import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';
import { AuthStore } from '../../store/auth.store';
import { ArticleDto } from '../../models/article.model';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './articles-list.component.html',
  styleUrl: './articles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesListComponent implements OnInit {
  readonly articlesStore = inject(ArticlesStore);
  readonly authStore = inject(AuthStore);

  public ngOnInit(): void {
    this.articlesStore.loadArticles();
  }

  /**
   * Check if the current user is the author of an article
   */
  protected isArticleAuthor(article: ArticleDto): boolean {
    const user = this.authStore.user();
    if (!user) {
      return false;
    }
    return article.author.id === user.id;
  }
}
