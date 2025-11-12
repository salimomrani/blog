import { ChangeDetectionStrategy, Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthStore } from '../../../store/auth.store';
import { IsAuthorPipe } from '../../../shared/pipes/is-author.pipe';
import { TextExcerptPipe } from '../../../shared/pipes/text-excerpt.pipe';
import { ArticleSearchComponent } from '../article-search/article-search.component';
import { ArticleSearchParams } from '../../../services/articles.service';
import { SpinnerComponent, ErrorMessageComponent, BadgeComponent } from '../../../shared/components';
import { ArticleLikeButtonComponent } from '../../../shared/components/article-like-button/article-like-button.component';
import { ArticleDto } from '../../../models/article.model';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IsAuthorPipe, TextExcerptPipe, ArticleSearchComponent, SpinnerComponent, ErrorMessageComponent, BadgeComponent, ArticleLikeButtonComponent],
  templateUrl: './articles-list.component.html',
  styleUrl: './articles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesListComponent implements OnInit {
  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly authStore = inject(AuthStore);

  // Computed signals for complex conditions
  protected readonly showNewArticleButton = computed(() =>
    this.authStore.isAuthenticated() && this.articlesStore.hasArticles()
  );

  protected readonly showEmptyState = computed(() =>
    !this.articlesStore.isLoading() && !this.articlesStore.hasArticles()
  );

  protected readonly showArticlesList = computed(() =>
    !this.articlesStore.isLoading() && this.articlesStore.hasArticles()
  );

  protected readonly emptyStateMessage = computed(() =>
    this.authStore.isAuthenticated()
      ? 'Commencez par créer votre premier article !'
      : 'Connectez-vous pour créer des articles'
  );

  protected readonly emptyStateButtonText = computed(() =>
    this.authStore.isAuthenticated() ? 'Créer un Article' : 'Se connecter'
  );

  protected readonly emptyStateButtonLink = computed(() =>
    this.authStore.isAuthenticated() ? '/articles/new' : '/auth/login'
  );

  public ngOnInit(): void {
    this.articlesStore.loadArticles();
  }

  protected onSearch(params: ArticleSearchParams): void {
    this.articlesStore.searchArticles(params);
  }

  protected onClearSearch(): void {
    this.articlesStore.loadArticles();
  }

  protected getArticleUrl(articleId: number): string {
    return `${window.location.origin}/articles/${articleId}`;
  }

  protected hasCategories(article: ArticleDto): boolean {
    return !!(article.categories && article.categories.length > 0);
  }

  protected hasTags(article: ArticleDto): boolean {
    return !!(article.tags && article.tags.length > 0);
  }
}
