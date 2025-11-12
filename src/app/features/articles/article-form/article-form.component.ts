import { ChangeDetectionStrategy, Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../../store/articles.store';
import { CategoriesStore } from '../../../store/categories.store';
import { TagsStore } from '../../../store/tags.store';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MarkdownModule],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly articlesStore = inject(ArticlesStore);
  readonly categoriesStore = inject(CategoriesStore);
  readonly tagsStore = inject(TagsStore);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    categoryIds: [[] as number[]],
    tagIds: [[] as number[]]
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
          content: article.content,
          categoryIds: article.categories?.map(c => c.id) ?? [],
          tagIds: article.tags?.map(t => t.id) ?? []
        });
      }
    });
  }

  public ngOnInit(): void {
    // Load categories and tags
    this.categoriesStore.loadCategories();
    this.tagsStore.loadTags();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.articleId = Number(id);
      this.articlesStore.loadArticleById(this.articleId);
    }
  }

  protected toggleCategory(categoryId: number): void {
    const currentIds = this.form.controls.categoryIds.value;
    const index = currentIds.indexOf(categoryId);

    if (index === -1) {
      this.form.controls.categoryIds.setValue([...currentIds, categoryId]);
    } else {
      this.form.controls.categoryIds.setValue(currentIds.filter(id => id !== categoryId));
    }
  }

  protected toggleTag(tagId: number): void {
    const currentIds = this.form.controls.tagIds.value;
    const index = currentIds.indexOf(tagId);

    if (index === -1) {
      this.form.controls.tagIds.setValue([...currentIds, tagId]);
    } else {
      this.form.controls.tagIds.setValue(currentIds.filter(id => id !== tagId));
    }
  }

  protected isCategorySelected(categoryId: number): boolean {
    return this.form.controls.categoryIds.value.includes(categoryId);
  }

  protected isTagSelected(tagId: number): boolean {
    return this.form.controls.tagIds.value.includes(tagId);
  }

  // CSS class helpers
  protected getCategoryButtonClass(categoryId: number): string {
    const isSelected = this.isCategorySelected(categoryId);
    return isSelected
      ? 'px-4 py-2 rounded-lg border-2 transition duration-150 bg-purple-100 border-purple-600 text-purple-700'
      : 'px-4 py-2 rounded-lg border-2 transition duration-150 bg-white border-gray-300 text-gray-700 hover:border-purple-400';
  }

  protected getTagButtonClass(tagId: number): string {
    const isSelected = this.isTagSelected(tagId);
    return isSelected
      ? 'px-3 py-1 rounded-full border-2 text-sm transition duration-150 bg-blue-100 border-blue-600 text-blue-700'
      : 'px-3 py-1 rounded-full border-2 text-sm transition duration-150 bg-white border-gray-300 text-gray-700 hover:border-blue-400';
  }

  protected getTitleInputClass(): string {
    const control = this.form.controls.title;
    return control.touched && control.invalid
      ? 'block w-full px-4 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150'
      : 'block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150';
  }

  protected getContentTextareaClass(): string {
    const control = this.form.controls.content;
    return control.touched && control.invalid
      ? 'block w-full px-4 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 font-mono text-sm resize-none'
      : 'block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 font-mono text-sm resize-none';
  }

  // Validation error messages
  protected getTitleError(): string | null {
    const control = this.form.controls.title;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le titre est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Minimum 5 caractères';
    }
    if (control.errors?.['maxlength']) {
      return 'Maximum 200 caractères';
    }
    return null;
  }

  protected getContentError(): string | null {
    const control = this.form.controls.content;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le contenu est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Minimum 10 caractères';
    }
    return null;
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
