import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';
import { AuthStore } from '../../store/auth.store';
import { IsAuthorPipe } from '../../shared/pipes/is-author.pipe';
import { TextExcerptPipe } from '../../shared/pipes/text-excerpt.pipe';
import { ArticleSearchComponent } from './article-search.component';
import { ArticleSearchParams } from '../../services/articles.service';
import { ShareComponent, SpinnerComponent, ErrorMessageComponent, BadgeComponent } from '../../shared/components';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IsAuthorPipe, TextExcerptPipe, ArticleSearchComponent, ShareComponent, SpinnerComponent, ErrorMessageComponent, BadgeComponent],
  templateUrl: './articles-list.component.html',
  styleUrl: './articles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlesListComponent implements OnInit {
  protected readonly articlesStore = inject(ArticlesStore);
  protected readonly authStore = inject(AuthStore);

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
}
