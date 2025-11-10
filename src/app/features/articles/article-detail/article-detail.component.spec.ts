import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailComponent } from './article-detail.component';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthStore } from '../../../store/auth.store';
import { signal } from '@angular/core';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let mockStore: Partial<ArticlesStore>;
  let mockAuthStore: Partial<AuthStore>;

  beforeEach(async () => {
    mockStore = {
      selectedArticle: signal(null),
      isLoading: signal(false),
      error: signal(null),
      loadArticleById: jest.fn(),
      deleteArticle: jest.fn()
    };

    mockAuthStore = {
      isAuthenticated: signal(false),
      user: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesStore, useValue: mockStore },
        { provide: AuthStore, useValue: mockAuthStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load article by id on init', () => {
    fixture.detectChanges();
    expect(mockStore.loadArticleById).toHaveBeenCalledWith(1);
  });

  it('should display loading state', () => {
    mockStore.isLoading = signal(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-spinner')).toBeTruthy();
  });
});
