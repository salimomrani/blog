import { ChangeDetectionStrategy, Component, input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommentsStore } from '../../../store/comments.store';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { CommentDto } from '../../../shared/models/comment.model';
import { ConfirmationDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentFormComponent, ConfirmationDialogComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit {
  readonly articleId = input.required<number>();

  readonly commentsStore = inject(CommentsStore);
  readonly authFacade = inject(AuthFacade);

  // Signal versions of auth state (converted from observables)
  readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$, { initialValue: false });
  readonly user = toSignal(this.authFacade.user$, { initialValue: null });

  readonly replyingTo = signal<number | null>(null);
  readonly showRepliesForCommentIds = signal(new Set<number>());
  protected readonly showDeleteDialog = signal(false);
  protected readonly commentToDelete = signal<number | null>(null);

  public ngOnInit(): void {
    this.commentsStore.loadCommentsByArticleId(this.articleId());
  }

  public deleteComment(commentId: number): void {
    this.commentToDelete.set(commentId);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(): void {
    const commentId = this.commentToDelete();
    if (commentId !== null) {
      this.commentsStore.deleteComment(commentId);
    }
    this.showDeleteDialog.set(false);
    this.commentToDelete.set(null);
  }

  protected onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.commentToDelete.set(null);
  }

  public isCommentAuthor(authorId: number): boolean {
    return this.user()?.id === authorId;
  }

  public toggleReply(commentId: number): void {
    this.replyingTo.update(current => (current === commentId ? null : commentId));
  }

  public onCommentSubmitted(): void {
    this.replyingTo.set(null);
  }

  public toggleShowReplies(commentId: number): void {
    this.showRepliesForCommentIds.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }

  public shouldShowReplies(commentId: number): boolean {
    return this.showRepliesForCommentIds().has(commentId);
  }

  public trackByComment(index: number, comment: CommentDto): number {
    return comment.id;
  }

  // Helper methods for template complexity reduction
  protected hasReplies(comment: CommentDto): boolean {
    return !!(comment.replies && comment.replies.length > 0);
  }

  protected canDeleteComment(comment: CommentDto): boolean {
    return this.isAuthenticated() && this.isCommentAuthor(comment.author.id);
  }

  protected showEmptyState(): boolean {
    return !this.commentsStore.isLoading() && !this.commentsStore.hasComments();
  }

  protected showCommentsList(): boolean {
    return !this.commentsStore.isLoading() && this.commentsStore.hasComments();
  }
}
