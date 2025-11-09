import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleSearchComponent } from './article-search.component';
import { CategoriesService } from '../../services/categories.service';
import { TagsService } from '../../services/tags.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('ArticleSearchComponent', () => {
  let component: ArticleSearchComponent;
  let fixture: ComponentFixture<ArticleSearchComponent>;
  let mockCategoriesService: Partial<CategoriesService>;
  let mockTagsService: Partial<TagsService>;

  beforeEach(async () => {
    mockCategoriesService = {
      getAll: jest.fn().mockReturnValue(of({
        success: true,
        message: 'Success',
        data: [
          { id: 1, name: 'Category 1', slug: 'category-1', createdAt: '', updatedAt: '' },
          { id: 2, name: 'Category 2', slug: 'category-2', createdAt: '', updatedAt: '' }
        ]
      }))
    };

    mockTagsService = {
      getAll: jest.fn().mockReturnValue(of({
        success: true,
        message: 'Success',
        data: [
          { id: 1, name: 'Tag 1', slug: 'tag-1', createdAt: '', updatedAt: '' },
          { id: 2, name: 'Tag 2', slug: 'tag-2', createdAt: '', updatedAt: '' }
        ]
      }))
    };

    await TestBed.configureTestingModule({
      imports: [ArticleSearchComponent, FormsModule],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: TagsService, useValue: mockTagsService }
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
    expect(mockCategoriesService.getAll).toHaveBeenCalled();
    expect(mockTagsService.getAll).toHaveBeenCalled();
    expect(component['categories']().length).toBe(2);
    expect(component['tags']().length).toBe(2);
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

  it('should handle error when loading categories fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockCategoriesService.getAll = jest.fn().mockReturnValue(
      throwError(() => new Error('Failed to load'))
    );

    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load categories:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should handle error when loading tags fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockTagsService.getAll = jest.fn().mockReturnValue(
      throwError(() => new Error('Failed to load'))
    );

    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load tags:',
      expect.any(Error)
    );
    expect(component['isLoadingFilters']()).toBe(false);
    consoleErrorSpy.mockRestore();
  });
});
