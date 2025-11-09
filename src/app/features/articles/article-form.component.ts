import { ChangeDetectionStrategy, Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesStore } from '../../store/articles.store';
import { CategoriesStore } from '../../store/categories.store';
import { TagsStore } from '../../store/tags.store';
import { QuillModule } from 'ngx-quill';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule, MarkdownModule],
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

  /**
   * Editor mode: 'rich' for Quill editor, 'markdown' for markdown with preview
   */
  protected readonly editorMode = signal<'rich' | 'markdown'>('markdown');

  /**
   * Quill editor configuration with rich formatting options
   */
  protected readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],                                         // remove formatting button
      ['link', 'image', 'video']                        // link, image, and video
    ]
  };

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

  protected toggleEditorMode(): void {
    this.editorMode.set(this.editorMode() === 'rich' ? 'markdown' : 'rich');
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
