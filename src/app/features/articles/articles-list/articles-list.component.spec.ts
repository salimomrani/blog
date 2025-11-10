import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticlesListComponent } from './articles-list.component';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthStore } from '../../../store/auth.store';
import { signal } from '@angular/core';
import { ArticleSearchParams } from '../../../services/articles.service';

describe('ArticlesListComponent', () => {
  let component: ArticlesListComponent;
  let fixture: ComponentFixture<ArticlesListComponent>;
  let mockStore: Partial<ArticlesStore>;
  let mockAuthStore: Partial<AuthStore>;

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

    mockAuthStore = {
      isAuthenticated: signal(false),
      user: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [ArticlesListComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArticlesStore, useValue: mockStore },
        { provide: AuthStore, useValue: mockAuthStore }
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
});
