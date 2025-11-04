import { TestBed } from '@angular/core/testing';
import { IsAuthorPipe } from './is-author.pipe';
import { AuthStore } from '../../store/auth.store';
import { signal } from '@angular/core';
import { ArticleDto } from '../../models/article.model';

describe('IsAuthorPipe', () => {
  let pipe: IsAuthorPipe;
  let mockAuthStore: Partial<AuthStore>;

  beforeEach(() => {
    mockAuthStore = {
      user: signal(null)
    };

    TestBed.configureTestingModule({
      providers: [
        IsAuthorPipe,
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    });

    pipe = TestBed.inject(IsAuthorPipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false when article is null', () => {
    expect(pipe.transform(null)).toBe(false);
  });

  it('should return false when user is not authenticated', () => {
    mockAuthStore.user = signal(null);
    const article = {
      id: 1,
      title: 'Test',
      content: 'Content',
      author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    } as ArticleDto;

    expect(pipe.transform(article)).toBe(false);
  });

  it('should return true when user is the article author', () => {
    mockAuthStore.user = signal({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: null,
      active: true,
      role: 'USER',
      emailVerified: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1
    });

    const article = {
      id: 1,
      title: 'Test',
      content: 'Content',
      author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    } as ArticleDto;

    expect(pipe.transform(article)).toBe(true);
  });

  it('should return false when user is not the article author', () => {
    mockAuthStore.user = signal({
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      email: 'jane@test.com',
      phone: null,
      active: true,
      role: 'USER',
      emailVerified: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      version: 1
    });

    const article = {
      id: 1,
      title: 'Test',
      content: 'Content',
      author: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com', fullName: 'John Doe' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    } as ArticleDto;

    expect(pipe.transform(article)).toBe(false);
  });
});
