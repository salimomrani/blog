import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesTagsManagementComponent } from './categories-tags-management.component';
import { CategoriesStore } from '../../store/categories.store';
import { TagsStore } from '../../store/tags.store';
import { CategoryDto } from '../../shared/models/category.model';
import { TagDto } from '../../shared/models/tag.model';
import { provideRouter } from '@angular/router';

describe('CategoriesTagsManagementComponent', () => {
  let component: CategoriesTagsManagementComponent;
  let fixture: ComponentFixture<CategoriesTagsManagementComponent>;
  let mockCategoriesStore: jest.Mocked<CategoriesStore>;
  let mockTagsStore: jest.Mocked<TagsStore>;

  const mockCategory: CategoryDto = {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockTag: TagDto = {
    id: 1,
    name: 'Angular',
    slug: 'angular',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    // Create mock stores with signal properties
    mockCategoriesStore = {
      categories: jest.fn(() => [mockCategory]),
      hasCategories: jest.fn(() => true),
      isLoading: jest.fn(() => false),
      error: jest.fn(() => null),
      loadCategories: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn()
    } as unknown as jest.Mocked<CategoriesStore>;

    mockTagsStore = {
      tags: jest.fn(() => [mockTag]),
      hasTags: jest.fn(() => true),
      isLoading: jest.fn(() => false),
      error: jest.fn(() => null),
      loadTags: jest.fn(),
      createTag: jest.fn(),
      updateTag: jest.fn(),
      deleteTag: jest.fn()
    } as unknown as jest.Mocked<TagsStore>;

    await TestBed.configureTestingModule({
      imports: [CategoriesTagsManagementComponent],
      providers: [
        { provide: CategoriesStore, useValue: mockCategoriesStore },
        { provide: TagsStore, useValue: mockTagsStore },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesTagsManagementComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load categories and tags on init', () => {
      fixture.detectChanges();

      expect(mockCategoriesStore.loadCategories).toHaveBeenCalledTimes(1);
      expect(mockTagsStore.loadTags).toHaveBeenCalledTimes(1);
    });

    it('should initialize forms with empty values', () => {
      expect(component.categoryForm.value).toEqual({
        name: '',
        description: ''
      });

      expect(component.tagForm.value).toEqual({
        name: ''
      });
    });

    it('should initialize editing IDs as null', () => {
      expect(component['editingCategoryId']).toBeNull();
      expect(component['editingTagId']).toBeNull();
    });

    it('should initialize delete dialog signals', () => {
      expect(component['showDeleteCategoryDialog']()).toBe(false);
      expect(component['categoryToDelete']()).toBeNull();
      expect(component['showDeleteTagDialog']()).toBe(false);
      expect(component['tagToDelete']()).toBeNull();
    });
  });

  describe('category form validation', () => {
    it('should have valid categoryForm when all required fields are filled', () => {
      component.categoryForm.patchValue({
        name: 'Test Category',
        description: 'Test Description'
      });

      expect(component.categoryForm.valid).toBe(true);
    });

    it('should have invalid categoryForm when name is empty', () => {
      component.categoryForm.patchValue({
        name: '',
        description: 'Test Description'
      });

      expect(component.categoryForm.valid).toBe(false);
      expect(component.categoryForm.get('name')?.hasError('required')).toBe(true);
    });

    it('should have invalid categoryForm when name is too short', () => {
      component.categoryForm.patchValue({
        name: 'A'
      });

      expect(component.categoryForm.valid).toBe(false);
      expect(component.categoryForm.get('name')?.hasError('minlength')).toBe(true);
    });

    it('should have invalid categoryForm when name is too long', () => {
      component.categoryForm.patchValue({
        name: 'A'.repeat(51)
      });

      expect(component.categoryForm.valid).toBe(false);
      expect(component.categoryForm.get('name')?.hasError('maxlength')).toBe(true);
    });
  });

  describe('category management', () => {
    it('should create category when form is valid and not editing', () => {
      const categoryData = {
        name: 'New Category',
        description: 'New Description'
      };
      component.categoryForm.patchValue(categoryData);

      component['onSubmitCategory']();

      expect(mockCategoriesStore.createCategory).toHaveBeenCalledWith(categoryData);
      expect(mockCategoriesStore.createCategory).toHaveBeenCalledTimes(1);
      expect(component.categoryForm.value).toEqual({ name: '', description: '' });
    });

    it('should update category when form is valid and editing', () => {
      const categoryId = 1;
      const categoryData = {
        name: 'Updated Category',
        description: 'Updated Description'
      };

      component['editingCategoryId'] = categoryId;
      component.categoryForm.patchValue(categoryData);

      component['onSubmitCategory']();

      expect(mockCategoriesStore.updateCategory).toHaveBeenCalledWith({
        id: categoryId,
        category: categoryData
      });
      expect(mockCategoriesStore.updateCategory).toHaveBeenCalledTimes(1);
      expect(component['editingCategoryId']).toBeNull();
      expect(component.categoryForm.value).toEqual({ name: '', description: '' });
    });

    it('should mark form as touched when submitting invalid form', () => {
      component.categoryForm.patchValue({ name: '' });
      const markAllAsTouchedSpy = jest.spyOn(component.categoryForm, 'markAllAsTouched');

      component['onSubmitCategory']();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(mockCategoriesStore.createCategory).not.toHaveBeenCalled();
    });

    it('should populate form when editing category', () => {
      const categoryId = 1;
      const categoryName = 'Test Category';
      const categoryDescription = 'Test Description';

      component['editCategory'](categoryId, categoryName, categoryDescription);

      expect(component['editingCategoryId']).toBe(categoryId);
      expect(component.categoryForm.value).toEqual({
        name: categoryName,
        description: categoryDescription
      });
    });

    it('should populate form with empty description when editing category without description', () => {
      const categoryId = 1;
      const categoryName = 'Test Category';

      component['editCategory'](categoryId, categoryName);

      expect(component['editingCategoryId']).toBe(categoryId);
      expect(component.categoryForm.value).toEqual({
        name: categoryName,
        description: ''
      });
    });

    it('should reset form and editing state when cancelling category edit', () => {
      component['editingCategoryId'] = 1;
      component.categoryForm.patchValue({ name: 'Test', description: 'Test' });

      component['cancelCategoryEdit']();

      expect(component['editingCategoryId']).toBeNull();
      expect(component.categoryForm.value).toEqual({ name: '', description: '' });
    });
  });

  describe('category delete confirmation dialog', () => {
    it('should open delete dialog when deleteCategory is called', () => {
      const categoryId = 1;
      const categoryName = 'Technology';

      component['deleteCategory'](categoryId, categoryName);

      expect(component['showDeleteCategoryDialog']()).toBe(true);
      expect(component['categoryToDelete']()).toEqual({ id: categoryId, name: categoryName });
    });

    it('should compute delete message with category name', () => {
      const categoryName = 'Technology';
      component['categoryToDelete'].set({ id: 1, name: categoryName });

      const message = component['categoryDeleteMessage']();

      expect(message).toBe(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`);
    });

    it('should return empty delete message when no category to delete', () => {
      component['categoryToDelete'].set(null);

      const message = component['categoryDeleteMessage']();

      expect(message).toBe('');
    });

    it('should call store deleteCategory and close dialog when deletion is confirmed', () => {
      const categoryId = 1;
      component['deleteCategory'](categoryId, 'Technology');

      component['onDeleteCategoryConfirmed']();

      expect(mockCategoriesStore.deleteCategory).toHaveBeenCalledWith(categoryId);
      expect(mockCategoriesStore.deleteCategory).toHaveBeenCalledTimes(1);
      expect(component['showDeleteCategoryDialog']()).toBe(false);
      expect(component['categoryToDelete']()).toBeNull();
    });

    it('should not call store deleteCategory when categoryToDelete is null', () => {
      component['categoryToDelete'].set(null);
      component['showDeleteCategoryDialog'].set(true);

      component['onDeleteCategoryConfirmed']();

      expect(mockCategoriesStore.deleteCategory).not.toHaveBeenCalled();
      expect(component['showDeleteCategoryDialog']()).toBe(false);
    });

    it('should close dialog without deleting when deletion is cancelled', () => {
      component['deleteCategory'](1, 'Technology');

      component['onDeleteCategoryCancelled']();

      expect(mockCategoriesStore.deleteCategory).not.toHaveBeenCalled();
      expect(component['showDeleteCategoryDialog']()).toBe(false);
      expect(component['categoryToDelete']()).toBeNull();
    });
  });

  describe('tag form validation', () => {
    it('should have valid tagForm when name is filled', () => {
      component.tagForm.patchValue({
        name: 'Test Tag'
      });

      expect(component.tagForm.valid).toBe(true);
    });

    it('should have invalid tagForm when name is empty', () => {
      component.tagForm.patchValue({
        name: ''
      });

      expect(component.tagForm.valid).toBe(false);
      expect(component.tagForm.get('name')?.hasError('required')).toBe(true);
    });

    it('should have invalid tagForm when name is too short', () => {
      component.tagForm.patchValue({
        name: 'A'
      });

      expect(component.tagForm.valid).toBe(false);
      expect(component.tagForm.get('name')?.hasError('minlength')).toBe(true);
    });

    it('should have invalid tagForm when name is too long', () => {
      component.tagForm.patchValue({
        name: 'A'.repeat(31)
      });

      expect(component.tagForm.valid).toBe(false);
      expect(component.tagForm.get('name')?.hasError('maxlength')).toBe(true);
    });
  });

  describe('tag management', () => {
    it('should create tag when form is valid and not editing', () => {
      const tagData = { name: 'New Tag' };
      component.tagForm.patchValue(tagData);

      component['onSubmitTag']();

      expect(mockTagsStore.createTag).toHaveBeenCalledWith(tagData);
      expect(mockTagsStore.createTag).toHaveBeenCalledTimes(1);
      expect(component.tagForm.value).toEqual({ name: '' });
    });

    it('should update tag when form is valid and editing', () => {
      const tagId = 1;
      const tagData = { name: 'Updated Tag' };

      component['editingTagId'] = tagId;
      component.tagForm.patchValue(tagData);

      component['onSubmitTag']();

      expect(mockTagsStore.updateTag).toHaveBeenCalledWith({
        id: tagId,
        tag: tagData
      });
      expect(mockTagsStore.updateTag).toHaveBeenCalledTimes(1);
      expect(component['editingTagId']).toBeNull();
      expect(component.tagForm.value).toEqual({ name: '' });
    });

    it('should mark form as touched when submitting invalid tag form', () => {
      component.tagForm.patchValue({ name: '' });
      const markAllAsTouchedSpy = jest.spyOn(component.tagForm, 'markAllAsTouched');

      component['onSubmitTag']();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(mockTagsStore.createTag).not.toHaveBeenCalled();
    });

    it('should populate form when editing tag', () => {
      const tagId = 1;
      const tagName = 'Test Tag';

      component['editTag'](tagId, tagName);

      expect(component['editingTagId']).toBe(tagId);
      expect(component.tagForm.value).toEqual({ name: tagName });
    });

    it('should reset form and editing state when cancelling tag edit', () => {
      component['editingTagId'] = 1;
      component.tagForm.patchValue({ name: 'Test' });

      component['cancelTagEdit']();

      expect(component['editingTagId']).toBeNull();
      expect(component.tagForm.value).toEqual({ name: '' });
    });
  });

  describe('tag delete confirmation dialog', () => {
    it('should open delete dialog when deleteTag is called', () => {
      const tagId = 1;
      const tagName = 'Angular';

      component['deleteTag'](tagId, tagName);

      expect(component['showDeleteTagDialog']()).toBe(true);
      expect(component['tagToDelete']()).toEqual({ id: tagId, name: tagName });
    });

    it('should compute delete message with tag name', () => {
      const tagName = 'Angular';
      component['tagToDelete'].set({ id: 1, name: tagName });

      const message = component['tagDeleteMessage']();

      expect(message).toBe(`Êtes-vous sûr de vouloir supprimer le tag "${tagName}" ?`);
    });

    it('should return empty delete message when no tag to delete', () => {
      component['tagToDelete'].set(null);

      const message = component['tagDeleteMessage']();

      expect(message).toBe('');
    });

    it('should call store deleteTag and close dialog when deletion is confirmed', () => {
      const tagId = 1;
      component['deleteTag'](tagId, 'Angular');

      component['onDeleteTagConfirmed']();

      expect(mockTagsStore.deleteTag).toHaveBeenCalledWith(tagId);
      expect(mockTagsStore.deleteTag).toHaveBeenCalledTimes(1);
      expect(component['showDeleteTagDialog']()).toBe(false);
      expect(component['tagToDelete']()).toBeNull();
    });

    it('should not call store deleteTag when tagToDelete is null', () => {
      component['tagToDelete'].set(null);
      component['showDeleteTagDialog'].set(true);

      component['onDeleteTagConfirmed']();

      expect(mockTagsStore.deleteTag).not.toHaveBeenCalled();
      expect(component['showDeleteTagDialog']()).toBe(false);
    });

    it('should close dialog without deleting when deletion is cancelled', () => {
      component['deleteTag'](1, 'Angular');

      component['onDeleteTagCancelled']();

      expect(mockTagsStore.deleteTag).not.toHaveBeenCalled();
      expect(component['showDeleteTagDialog']()).toBe(false);
      expect(component['tagToDelete']()).toBeNull();
    });
  });

  describe('store integration', () => {
    it('should access categories from store', () => {
      const categories = component.categoriesStore.categories();

      expect(categories).toEqual([mockCategory]);
      expect(mockCategoriesStore.categories).toHaveBeenCalled();
    });

    it('should access tags from store', () => {
      const tags = component.tagsStore.tags();

      expect(tags).toEqual([mockTag]);
      expect(mockTagsStore.tags).toHaveBeenCalled();
    });
  });
});
