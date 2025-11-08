import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleSearchParams } from '../../services/articles.service';
import { CategoriesService } from '../../services/categories.service';
import { TagsService } from '../../services/tags.service';
import { CategoryDto } from '../../shared/models/category.model';
import { TagDto } from '../../shared/models/tag.model';

@Component({
  selector: 'app-article-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-search.component.html',
  styleUrl: './article-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleSearchComponent implements OnInit {
  @Output() public readonly search = new EventEmitter<ArticleSearchParams>();
  @Output() public readonly clearSearch = new EventEmitter<void>();

  private readonly categoriesService = inject(CategoriesService);
  private readonly tagsService = inject(TagsService);

  protected readonly searchQuery = signal<string>('');
  protected readonly selectedCategoryId = signal<number | undefined>(undefined);
  protected readonly selectedTagId = signal<number | undefined>(undefined);
  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly tags = signal<TagDto[]>([]);
  protected readonly isLoadingFilters = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadFilters();
  }

  private loadFilters(): void {
    this.isLoadingFilters.set(true);

    // Load categories
    this.categoriesService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (error) => console.error('Failed to load categories:', error)
    });

    // Load tags
    this.tagsService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.tags.set(response.data);
        }
        this.isLoadingFilters.set(false);
      },
      error: (error) => {
        console.error('Failed to load tags:', error);
        this.isLoadingFilters.set(false);
      }
    });
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
      this.search.emit(params);
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

  protected hasActiveFilters(): boolean {
    return !!this.searchQuery().trim() ||
           this.selectedCategoryId() !== undefined ||
           this.selectedTagId() !== undefined;
  }
}
