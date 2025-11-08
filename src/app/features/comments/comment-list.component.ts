import { ChangeDetectionStrategy, Component, input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsStore } from '../../store/comments.store';
import { AuthStore } from '../../store/auth.store';
import { CommentFormComponent } from './comment-form.component';
import { CommentDto } from '../../shared/models/comment.model';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentFormComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit {
  readonly articleId = input.required<number>();

  readonly commentsStore = inject(CommentsStore);
  readonly authStore = inject(AuthStore);

  readonly replyingTo = signal<number | null>(null);
  readonly showRepliesForCommentIds = signal(new Set<number>());

  public ngOnInit(): void {
    this.commentsStore.loadCommentsByArticleId(this.articleId());
  }

  public deleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible et supprimera également toutes les réponses.')) {
      this.commentsStore.deleteComment(commentId);
    }
  }

  public isCommentAuthor(authorId: number): boolean {
    const currentUser = this.authStore.user();
    return currentUser?.id === authorId;
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
}

