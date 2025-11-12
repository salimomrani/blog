import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailComponent } from './article-detail.component';
import { ArticlesStore } from '../../../store/articles.store';
import { AuthFacade } from '../../../store/auth/auth.facade';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let mockStore: Partial<ArticlesStore>;
  let mockAuthFacade: Partial<AuthFacade>;

  beforeEach(async () => {
    mockStore = {
      selectedArticle: signal(null),
      isLoading: signal(false),
      error: signal(null),
      loadArticleById: jest.fn(),
      deleteArticle: jest.fn(),
      recordView: jest.fn()
    };

    mockAuthFacade = {
      isAuthenticated$: of(false),
      user$: of(null)
    };

    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesStore, useValue: mockStore },
        { provide: AuthFacade, useValue: mockAuthFacade },
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
    expect(mockStore.recordView).toHaveBeenCalledWith(1);
  });

  it('should display loading state', () => {
    mockStore.isLoading = signal(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-spinner')).toBeTruthy();
  });
});
