import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentsStore } from '../../../store/comments.store';
import { AuthFacade } from '../../../store/auth/auth.facade';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentFormComponent {
  readonly articleId = input.required<number>();
  readonly parentId = input<number | undefined>();

  readonly commentSubmitted = output<void>();

  private readonly fb = inject(FormBuilder);
  readonly commentsStore = inject(CommentsStore);
  readonly authFacade = inject(AuthFacade);

  // Signal version of auth state (converted from observable)
  readonly isAuthenticated = toSignal(this.authFacade.isAuthenticated$, { initialValue: false });

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]]
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    this.commentsStore.createComment({
      content: formValue.content,
      articleId: this.articleId(),
      parentId: this.parentId()
    });

    // Reset form after submission
    this.form.reset();
    this.commentSubmitted.emit();
  }

  protected onCancel(): void {
    this.commentSubmitted.emit();
  }
}
