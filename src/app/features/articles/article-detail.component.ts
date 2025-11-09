import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';
import { AuthStore } from '../../store/auth.store';
import { IsAuthorPipe } from '../../shared/pipes/is-author.pipe';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { CommentListComponent } from '../comments/comment-list.component';
import { CommentFormComponent } from '../comments/comment-form.component';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, IsAuthorPipe, MarkdownPipe, CommentListComponent, CommentFormComponent],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleDetailComponent implements OnInit {
  readonly articlesStore = inject(ArticlesStore);
  readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.articlesStore.loadArticleById(id);
    }
  }

  protected onDelete(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      const id = this.articlesStore.selectedArticle()?.id;
      if (id) {
        this.articlesStore.deleteArticle(id);
        setTimeout(() => this.router.navigate(['/articles']), 500);
      }
    }
  }
}
