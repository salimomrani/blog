import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ArticlesService } from './articles.service';
import { CreateArticleRequest, UpdateArticleRequest } from '../models/article.model';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/v1/articles';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ArticlesService]
    });
    service = TestBed.inject(ArticlesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all articles', () => {
      const mockResponse = {
        success: true,
        message: 'Articles retrieved',
        data: [
          { id: 1, title: 'Test Article', content: 'Content', author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ]
      };

      service.getAll().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.length).toBe(1);
        expect(response.data[0].title).toBe('Test Article');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return article by id', () => {
      const mockResponse = {
        success: true,
        message: 'Article found',
        data: { id: 1, title: 'Test Article', content: 'Content', author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      };

      service.getById(1).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.id).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new article', () => {
      const newArticle: CreateArticleRequest = {
        title: 'New Article',
        content: 'New content'
      };

      const mockResponse = {
        success: true,
        message: 'Article created',
        data: { id: 2, title: 'New Article', content: 'New content', author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      };

      service.create(newArticle).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.title).toBe('New Article');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newArticle);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing article', () => {
      const updateArticle: UpdateArticleRequest = {
        title: 'Updated Article',
        content: 'Updated content'
      };

      const mockResponse = {
        success: true,
        message: 'Article updated',
        data: { id: 1, title: 'Updated Article', content: 'Updated content', author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      };

      service.update(1, updateArticle).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.title).toBe('Updated Article');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateArticle);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an article', () => {
      const mockResponse = {
        success: true,
        message: 'Article deleted',
        data: null
      };

      service.delete(1).subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
