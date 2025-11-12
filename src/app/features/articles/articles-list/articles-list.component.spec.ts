import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticlesListComponent } from './articles-list.component';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ArticleSearchParams } from '../../../services/articles.service';

describe('ArticlesListComponent', () => {
  let component: ArticlesListComponent;
  let fixture: ComponentFixture<ArticlesListComponent>;
  let mockStore: Partial<ArticlesStore>;
  let mockAuthFacade: Partial<AuthFacade>;

  beforeEach(async () => {
    mockStore = {
      articles: signal([]),
      isLoading: signal(false),
      error: signal(null),
      hasArticles: signal(false),
      articlesCount: signal(0),
      loadArticles: jest.fn(),
      searchArticles: jest.fn()
    };

    mockAuthFacade = {
      isAuthenticated$: of(false),
      user$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [ArticlesListComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArticlesStore, useValue: mockStore },
        { provide: AuthFacade, useValue: mockAuthFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load articles on init', () => {
    fixture.detectChanges();
    expect(mockStore.loadArticles).toHaveBeenCalled();
  });

  it('should call searchArticles when onSearch is triggered', () => {
    const params: ArticleSearchParams = { query: 'test' };
    component.onSearch(params);
    expect(mockStore.searchArticles).toHaveBeenCalledWith(params);
  });

  it('should call loadArticles when onClearSearch is triggered', () => {
    component.onClearSearch();
    expect(mockStore.loadArticles).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    mockStore.isLoading = signal(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-spinner')).toBeTruthy();
  });

  it('should display error message', () => {
    mockStore.error = signal('Error loading articles');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('app-error-message');
    expect(errorElement).toBeTruthy();
  });

  it('should display empty state when no articles', () => {
    mockStore.hasArticles = signal(false);
    mockStore.isLoading = signal(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aucun article');
  });

  it('should display article stats', () => {
    const mockArticle = {
      id: 1,
      title: 'Test Article',
      content: 'Test content',
      author: { id: 1, fullName: 'Test Author' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 10,
      likedByCurrentUser: false,
      viewsCount: 100,
      commentsCount: 5,
    };
    mockStore.articles = signal([mockArticle]);
    mockStore.hasArticles = signal(true);
    mockStore.isLoading = signal(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statsElement = compiled.querySelector('.flex.items-center.gap-4');
    expect(statsElement).toBeTruthy();
    expect(statsElement?.textContent).toContain('5'); // comments
    expect(statsElement?.textContent).toContain('100'); // views
  });
});
