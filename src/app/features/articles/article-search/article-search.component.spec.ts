import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleSearchComponent } from './article-search.component';
import { CategoriesStore } from '../../../store/categories.store';
import { TagsStore } from '../../../store/tags.store';
import { signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryDto } from '../../../shared/models/category.model';
import { TagDto } from '../../../shared/models/tag.model';

describe('ArticleSearchComponent', () => {
  let component: ArticleSearchComponent;
  let fixture: ComponentFixture<ArticleSearchComponent>;
  let mockCategoriesStore: {
    categories: WritableSignal<CategoryDto[]>;
    isLoading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    loadCategories: jest.Mock;
  };
  let mockTagsStore: {
    tags: WritableSignal<TagDto[]>;
    isLoading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    loadTags: jest.Mock;
  };

  beforeEach(async () => {
    mockCategoriesStore = {
      categories: signal([
        { id: 1, name: 'Category 1', slug: 'category-1', createdAt: '', updatedAt: '' },
        { id: 2, name: 'Category 2', slug: 'category-2', createdAt: '', updatedAt: '' }
      ]),
      isLoading: signal(false),
      error: signal(null),
      loadCategories: jest.fn()
    };

    mockTagsStore = {
      tags: signal([
        { id: 1, name: 'Tag 1', slug: 'tag-1', createdAt: '', updatedAt: '' },
        { id: 2, name: 'Tag 2', slug: 'tag-2', createdAt: '', updatedAt: '' }
      ]),
      isLoading: signal(false),
      error: signal(null),
      loadTags: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ArticleSearchComponent, FormsModule],
      providers: [
        { provide: CategoriesStore, useValue: mockCategoriesStore },
        { provide: TagsStore, useValue: mockTagsStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories and tags on init', () => {
    fixture.detectChanges();
    expect(mockCategoriesStore.loadCategories).toHaveBeenCalled();
    expect(mockTagsStore.loadTags).toHaveBeenCalled();
    expect(component['categoriesStore'].categories().length).toBe(2);
    expect(component['tagsStore'].tags().length).toBe(2);
  });

  it('should emit searchChange with query when onSearch is called', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['searchQuery'].set('test query');
    component['onSearch']();

    expect(searchChangeSpy).toHaveBeenCalledWith({ query: 'test query' });
  });

  it('should emit searchChange with categoryId when category is selected', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['selectedCategoryId'].set(1);
    component['onSearch']();

    expect(searchChangeSpy).toHaveBeenCalledWith({ categoryId: 1 });
  });

  it('should emit searchChange with tagId when tag is selected', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['selectedTagId'].set(2);
    component['onSearch']();

    expect(searchChangeSpy).toHaveBeenCalledWith({ tagId: 2 });
  });

  it('should emit searchChange with all params when multiple filters are set', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['searchQuery'].set('angular');
    component['selectedCategoryId'].set(1);
    component['selectedTagId'].set(2);
    component['onSearch']();

    expect(searchChangeSpy).toHaveBeenCalledWith({
      query: 'angular',
      categoryId: 1,
      tagId: 2
    });
  });

  it('should not emit searchChange when no filters are active', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['onSearch']();

    expect(searchChangeSpy).not.toHaveBeenCalled();
  });

  it('should clear all filters and emit clearSearch when onClear is called', () => {
    const clearSearchSpy = jest.fn();
    component.clearSearch.subscribe(clearSearchSpy);

    component['searchQuery'].set('test');
    component['selectedCategoryId'].set(1);
    component['selectedTagId'].set(2);

    component['onClear']();

    expect(component['searchQuery']()).toBe('');
    expect(component['selectedCategoryId']()).toBeUndefined();
    expect(component['selectedTagId']()).toBeUndefined();
    expect(clearSearchSpy).toHaveBeenCalled();
  });

  it('should trigger search on Enter key press', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);
    component['searchQuery'].set('test');

    const event = new KeyboardEvent('keypress', { key: 'Enter' });
    component['onKeyPress'](event);

    expect(searchChangeSpy).toHaveBeenCalledWith({ query: 'test' });
  });

  it('should return true for hasActiveFilters when query is set', () => {
    component['searchQuery'].set('test');
    expect(component['hasActiveFilters']()).toBe(true);
  });

  it('should return true for hasActiveFilters when category is selected', () => {
    component['selectedCategoryId'].set(1);
    expect(component['hasActiveFilters']()).toBe(true);
  });

  it('should return true for hasActiveFilters when tag is selected', () => {
    component['selectedTagId'].set(1);
    expect(component['hasActiveFilters']()).toBe(true);
  });

  it('should return false for hasActiveFilters when no filters are set', () => {
    expect(component['hasActiveFilters']()).toBe(false);
  });

  it('should compute isLoadingFilters from stores', () => {
    expect(component['isLoadingFilters']()).toBe(false);

    mockCategoriesStore.isLoading.set(true);
    fixture.detectChanges();

    expect(component['isLoadingFilters']()).toBe(true);

    mockCategoriesStore.isLoading.set(false);
    mockTagsStore.isLoading.set(true);
    fixture.detectChanges();

    expect(component['isLoadingFilters']()).toBe(true);
  });

  it('should compute selectedCategory from categoriesStore', () => {
    component['selectedCategoryId'].set(1);
    fixture.detectChanges();

    expect(component['selectedCategory']()?.name).toBe('Category 1');
  });

  it('should compute selectedTag from tagsStore', () => {
    component['selectedTagId'].set(2);
    fixture.detectChanges();

    expect(component['selectedTag']()?.name).toBe('Tag 2');
  });

  it('should trigger search when category is changed', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['onCategoryChange']('1');

    expect(component['selectedCategoryId']()).toBe(1);
    expect(searchChangeSpy).toHaveBeenCalledWith({ categoryId: 1 });
  });

  it('should clear category when empty string is passed to onCategoryChange', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['selectedCategoryId'].set(1);
    component['onCategoryChange']('');

    expect(component['selectedCategoryId']()).toBeUndefined();
    expect(searchChangeSpy).not.toHaveBeenCalled();
  });

  it('should trigger search when tag is changed', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['onTagChange']('2');

    expect(component['selectedTagId']()).toBe(2);
    expect(searchChangeSpy).toHaveBeenCalledWith({ tagId: 2 });
  });

  it('should clear tag when empty string is passed to onTagChange', () => {
    const searchChangeSpy = jest.fn();
    component.searchChange.subscribe(searchChangeSpy);

    component['selectedTagId'].set(2);
    component['onTagChange']('');

    expect(component['selectedTagId']()).toBeUndefined();
    expect(searchChangeSpy).not.toHaveBeenCalled();
  });
});
