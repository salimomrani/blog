import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { ExportService } from '../../../services/export.service';
import { AnalyticsService } from '../../../services/analytics.service';
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
  readonly authFacade = inject(AuthFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exportService = inject(ExportService);
  private readonly analyticsService = inject(AnalyticsService);

  // Signal version of auth state (converted from observable)
  readonly user = toSignal(this.authFacade.user$, { initialValue: null });
  readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$, { initialValue: false });

  protected readonly showDeleteDialog = signal(false);
  protected readonly isExporting = signal(false);

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

  /**
   * Export current article to PDF
   * Calls backend to generate PDF and triggers browser download
   */
  protected onExportToPdf(): void {
    const article = this.articlesStore.selectedArticle();
    if (!article) {
      return;
    }

    this.isExporting.set(true);

    this.exportService.exportArticleToPdf(article.id).subscribe({
      next: (blob) => {
        // Generate filename from article title
        const filename = this.exportService.generatePdfFilename(article.id, article.title);

        // Trigger browser download
        this.exportService.downloadFile(blob, filename);

        // Track export event in Google Analytics
        this.analyticsService.trackEvent('article_export_pdf', 'content', String(article.id));

        this.isExporting.set(false);
      },
      error: (error) => {
        console.error('Error exporting article to PDF:', error);

        // TODO: Show error notification to user
        // For now, just log and reset loading state
        this.isExporting.set(false);
      }
    });
  }
}
