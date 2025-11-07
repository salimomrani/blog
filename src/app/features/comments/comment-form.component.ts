import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentsStore } from '../../store/comments.store';
import { AuthStore } from '../../store/auth.store';

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

  private readonly fb = inject(FormBuilder);
  readonly commentsStore = inject(CommentsStore);
  readonly authStore = inject(AuthStore);

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
      articleId: this.articleId()
    });

    // Reset form after submission
    this.form.reset();
  }
}
