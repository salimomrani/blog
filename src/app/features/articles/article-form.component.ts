import { ChangeDetectionStrategy, Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly articlesStore = inject(ArticlesStore);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    content: ['', [Validators.required, Validators.minLength(10)]]
  });

  protected isEditMode = false;
  protected articleId: number | null = null;

  constructor() {
    // Effect to populate form when selectedArticle changes
    effect(() => {
      const article = this.articlesStore.selectedArticle();
      if (article && this.isEditMode) {
        this.form.patchValue({
          title: article.title,
          content: article.content
        });
      }
    });
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.articleId = Number(id);
      this.articlesStore.loadArticleById(this.articleId);
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    if (this.isEditMode && this.articleId) {
      this.articlesStore.updateArticle({ id: this.articleId, article: formValue });
    } else {
      this.articlesStore.createArticle(formValue);
    }

    setTimeout(() => this.router.navigate(['/articles']), 500);
  }
}
