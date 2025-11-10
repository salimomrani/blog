import { ChangeDetectionStrategy, Component, OnInit, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleSearchParams } from '../../../services/articles.service';
import { CategoriesStore } from '../../../store/categories.store';
import { TagsStore } from '../../../store/tags.store';

@Component({
  selector: 'app-article-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-search.component.html',
  styleUrl: './article-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleSearchComponent implements OnInit {
  public readonly searchChange = output<ArticleSearchParams>();
  public readonly clearSearch = output<void>();

  protected readonly categoriesStore = inject(CategoriesStore);
  protected readonly tagsStore = inject(TagsStore);

  protected readonly searchQuery = signal<string>('');
  protected readonly selectedCategoryId = signal<number | undefined>(undefined);
  protected readonly selectedTagId = signal<number | undefined>(undefined);

  protected readonly selectedCategory = computed(() =>
    this.categoriesStore.categories().find(c => c.id === this.selectedCategoryId())
  );

  protected readonly selectedTag = computed(() =>
    this.tagsStore.tags().find(t => t.id === this.selectedTagId())
  );

  protected readonly isLoadingFilters = computed(() =>
    this.categoriesStore.isLoading() || this.tagsStore.isLoading()
  );

  public ngOnInit(): void {
    this.loadFilters();
  }

  private loadFilters(): void {
    this.categoriesStore.loadCategories();
    this.tagsStore.loadTags();
  }

  protected onSearch(): void {
    const params: ArticleSearchParams = {};

    const query = this.searchQuery().trim();
    if (query) {
      params.query = query;
    }

    const categoryId = this.selectedCategoryId();
    if (categoryId) {
      params.categoryId = categoryId;
    }

    const tagId = this.selectedTagId();
    if (tagId) {
      params.tagId = tagId;
    }

    // Only search if at least one filter is set
    if (params.query || params.categoryId || params.tagId) {
      this.searchChange.emit(params);
    }
  }

  protected onClear(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set(undefined);
    this.selectedTagId.set(undefined);
    this.clearSearch.emit();
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  protected onCategoryChange(value: string): void {
    this.selectedCategoryId.set(value === '' ? undefined : +value);
    this.onSearch();
  }

  protected onTagChange(value: string): void {
    this.selectedTagId.set(value === '' ? undefined : +value);
    this.onSearch();
  }

  protected hasActiveFilters(): boolean {
    return !!this.searchQuery().trim() ||
           this.selectedCategoryId() !== undefined ||
           this.selectedTagId() !== undefined;
  }
}
