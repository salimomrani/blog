import { TestBed } from '@angular/core/testing';
import { ArticlesStore } from './articles.store';
import { ArticlesService } from '../services/articles.service';
import { of, throwError } from 'rxjs';
import { ArticleDto, CreateArticleRequest, UpdateArticleRequest } from '../models/article.model';

describe('ArticlesStore', () => {
  let store: InstanceType<typeof ArticlesStore>;
  let mockArticlesService: jest.Mocked<ArticlesService>;

  const mockArticle: ArticleDto = {
    id: 1,
    title: 'Test Article',
    content: 'Test content',
    author: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      fullName: 'John Doe'
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(() => {
    mockArticlesService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<ArticlesService>;

    TestBed.configureTestingModule({
      providers: [
        ArticlesStore,
        { provide: ArticlesService, useValue: mockArticlesService }
      ]
    });

    store = TestBed.inject(ArticlesStore);
  });

  describe('Initial State', () => {
    it('should initialize with empty articles array', () => {
      expect(store.articles()).toEqual([]);
    });

    it('should initialize with null selectedArticle', () => {
      expect(store.selectedArticle()).toBeNull();
    });

    it('should initialize with isLoading false', () => {
      expect(store.isLoading()).toBe(false);
    });

    it('should initialize with null error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    it('should compute articlesCount correctly', () => {
      expect(store.articlesCount()).toBe(0);

      mockArticlesService.getAll.mockReturnValue(of({
        success: true,
        message: 'Articles retrieved',
        data: [mockArticle]
      }));

      store.loadArticles();

      expect(store.articlesCount()).toBe(1);
    });

    it('should compute hasArticles correctly', () => {
      expect(store.hasArticles()).toBe(false);

      mockArticlesService.getAll.mockReturnValue(of({
        success: true,
        message: 'Articles retrieved',
        data: [mockArticle]
      }));

      store.loadArticles();

      expect(store.hasArticles()).toBe(true);
    });
  });

  describe('loadArticles', () => {
    it('should load articles successfully', (done) => {
      const mockResponse = {
        success: true,
        message: 'Articles retrieved',
        data: [mockArticle]
      };

      mockArticlesService.getAll.mockReturnValue(of(mockResponse));

      store.loadArticles();

      setTimeout(() => {
        expect(store.articles()).toEqual([mockArticle]);
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(mockArticlesService.getAll).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle error when loading articles fails', (done) => {
      const errorResponse = {
        error: { message: 'Server error' }
      };

      mockArticlesService.getAll.mockReturnValue(throwError(() => errorResponse));

      store.loadArticles();

      setTimeout(() => {
        expect(store.articles()).toEqual([]);
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBe('Server error');
        done();
      }, 0);
    });
  });

  describe('loadArticleById', () => {
    it('should load article by id successfully', (done) => {
      const mockResponse = {
        success: true,
        message: 'Article found',
        data: mockArticle
      };

      mockArticlesService.getById.mockReturnValue(of(mockResponse));

      store.loadArticleById(1);

      setTimeout(() => {
        expect(store.selectedArticle()).toEqual(mockArticle);
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(mockArticlesService.getById).toHaveBeenCalledWith(1);
        done();
      }, 0);
    });

    it('should handle error when article not found', (done) => {
      const errorResponse = {
        error: { message: 'Article not found' }
      };

      mockArticlesService.getById.mockReturnValue(throwError(() => errorResponse));

      store.loadArticleById(999);

      setTimeout(() => {
        expect(store.selectedArticle()).toBeNull();
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBe('Article not found');
        done();
      }, 0);
    });
  });

  describe('createArticle', () => {
    it('should create article successfully', (done) => {
      const newArticle: CreateArticleRequest = {
        title: 'New Article',
        content: 'New content'
      };

      const mockResponse = {
        success: true,
        message: 'Article created',
        data: { ...mockArticle, id: 2, ...newArticle }
      };

      mockArticlesService.create.mockReturnValue(of(mockResponse));

      store.createArticle(newArticle);

      setTimeout(() => {
        expect(store.articles()).toContainEqual(mockResponse.data);
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(mockArticlesService.create).toHaveBeenCalledWith(newArticle);
        done();
      }, 0);
    });

    it('should handle error when creating article fails', (done) => {
      const newArticle: CreateArticleRequest = {
        title: 'New Article',
        content: 'New content'
      };

      const errorResponse = {
        error: { message: 'Creation failed' }
      };

      mockArticlesService.create.mockReturnValue(throwError(() => errorResponse));

      store.createArticle(newArticle);

      setTimeout(() => {
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBe('Creation failed');
        done();
      }, 0);
    });
  });

  describe('updateArticle', () => {
    it('should update article successfully', (done) => {
      // First load an article
      mockArticlesService.getAll.mockReturnValue(of({
        success: true,
        message: 'Articles retrieved',
        data: [mockArticle]
      }));

      store.loadArticles();

      setTimeout(() => {
        const updateData: UpdateArticleRequest = {
          title: 'Updated Article',
          content: 'Updated content'
        };

        const updatedArticle = { ...mockArticle, ...updateData };

        const mockResponse = {
          success: true,
          message: 'Article updated',
          data: updatedArticle
        };

        mockArticlesService.update.mockReturnValue(of(mockResponse));

        store.updateArticle({ id: 1, article: updateData });

        setTimeout(() => {
          expect(store.articles()[0]).toEqual(updatedArticle);
          expect(store.selectedArticle()).toEqual(updatedArticle);
          expect(store.isLoading()).toBe(false);
          expect(store.error()).toBeNull();
          expect(mockArticlesService.update).toHaveBeenCalledWith(1, updateData);
          done();
        }, 0);
      }, 0);
    });

    it('should handle error when updating article fails', (done) => {
      const updateData: UpdateArticleRequest = {
        title: 'Updated Article',
        content: 'Updated content'
      };

      const errorResponse = {
        error: { message: 'Update failed' }
      };

      mockArticlesService.update.mockReturnValue(throwError(() => errorResponse));

      store.updateArticle({ id: 1, article: updateData });

      setTimeout(() => {
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBe('Update failed');
        done();
      }, 0);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', (done) => {
      // First load articles
      mockArticlesService.getAll.mockReturnValue(of({
        success: true,
        message: 'Articles retrieved',
        data: [mockArticle]
      }));

      store.loadArticles();

      setTimeout(() => {
        expect(store.articles()).toHaveLength(1);

        const mockResponse = {
          success: true,
          message: 'Article deleted',
          data: null
        };

        mockArticlesService.delete.mockReturnValue(of(mockResponse));

        store.deleteArticle(1);

        setTimeout(() => {
          expect(store.articles()).toHaveLength(0);
          expect(store.isLoading()).toBe(false);
          expect(store.error()).toBeNull();
          expect(mockArticlesService.delete).toHaveBeenCalledWith(1);
          done();
        }, 0);
      }, 0);
    });

    it('should handle error when deleting article fails', (done) => {
      const errorResponse = {
        error: { message: 'Deletion failed' }
      };

      mockArticlesService.delete.mockReturnValue(throwError(() => errorResponse));

      store.deleteArticle(1);

      setTimeout(() => {
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBe('Deletion failed');
        done();
      }, 0);
    });
  });

  describe('clearSelectedArticle', () => {
    it('should clear selected article', (done) => {
      // First set a selected article
      mockArticlesService.getById.mockReturnValue(of({
        success: true,
        message: 'Article found',
        data: mockArticle
      }));

      store.loadArticleById(1);

      setTimeout(() => {
        expect(store.selectedArticle()).toEqual(mockArticle);

        store.clearSelectedArticle();

        expect(store.selectedArticle()).toBeNull();
        done();
      }, 0);
    });
  });

  describe('clearError', () => {
    it('should clear error', (done) => {
      // First create an error
      const errorResponse = {
        error: { message: 'Test error' }
      };

      mockArticlesService.getAll.mockReturnValue(throwError(() => errorResponse));

      store.loadArticles();

      setTimeout(() => {
        expect(store.error()).toBe('Test error');

        store.clearError();

        expect(store.error()).toBeNull();
        done();
      }, 0);
    });
  });
});
