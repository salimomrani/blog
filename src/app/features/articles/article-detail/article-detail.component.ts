import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthStore } from '../../../store/auth.store';
import { IsAuthorPipe } from '../../../shared/pipes/is-author.pipe';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { CommentListComponent } from '../../comments/comment-list/comment-list.component';
import { CommentFormComponent } from '../../comments/comment-form/comment-form.component';
import { ShareComponent, SpinnerComponent, BadgeComponent, ConfirmationDialogComponent } from '../../../shared/components';
import { ArticleLikeButtonComponent } from '../../../shared/components/article-like-button/article-like-button.component';
import { signal } from '@angular/core';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, IsAuthorPipe, MarkdownPipe, CommentListComponent, CommentFormComponent, ShareComponent, SpinnerComponent, BadgeComponent, ConfirmationDialogComponent, ArticleLikeButtonComponent],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleDetailComponent implements OnInit {
  readonly articlesStore = inject(ArticlesStore);
  readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly showDeleteDialog = signal(false);

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.articlesStore.loadArticleById(id);
      this.articlesStore.recordView(id);
    }
  }

  protected onDeleteClick(): void {
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(): void {
    const id = this.articlesStore.selectedArticle()?.id;
    if (id) {
      this.articlesStore.deleteArticle(id);
      setTimeout(() => this.router.navigate(['/articles']), 500);
    }
    this.showDeleteDialog.set(false);
  }

  protected onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
  }

  protected getArticleUrl(): string {
    return window.location.href;
  }
}
