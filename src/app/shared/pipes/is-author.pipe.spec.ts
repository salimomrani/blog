import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { IsAuthorPipe } from './is-author.pipe';
import { selectUserId } from '../../store/auth';
import { ArticleDto } from '../../models/article.model';

describe('IsAuthorPipe', () => {
  let pipe: IsAuthorPipe;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IsAuthorPipe,
        provideMockStore({
          selectors: [
            { selector: selectUserId, value: null }
          ]
        })
      ]
    });

    pipe = TestBed.inject(IsAuthorPipe);
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false when article is null', () => {
    expect(pipe.transform(null)).toBe(false);
  });

  it('should return false when user is not authenticated', () => {
    store.overrideSelector(selectUserId, null);
    store.refreshState();

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
    store.overrideSelector(selectUserId, 1);
    store.refreshState();

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
    store.overrideSelector(selectUserId, 2);
    store.refreshState();

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
