import { ChangeDetectionStrategy, Component, input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsStore } from '../../store/comments.store';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit {
  readonly articleId = input.required<number>();

  readonly commentsStore = inject(CommentsStore);
  readonly authStore = inject(AuthStore);

  public ngOnInit(): void {
    this.commentsStore.loadCommentsByArticleId(this.articleId());
  }

  public deleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.commentsStore.deleteComment(commentId);
    }
  }

  public isCommentAuthor(authorId: number): boolean {
    const currentUser = this.authStore.currentUser();
    return currentUser?.id === authorId;
  }
}
