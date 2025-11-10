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
