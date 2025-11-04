import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ArticleFormComponent } from './article-form.component';
import { ArticlesStore } from '../../store/articles.store';
import { signal } from '@angular/core';

describe('ArticleFormComponent', () => {
  let component: ArticleFormComponent;
  let fixture: ComponentFixture<ArticleFormComponent>;
  let mockStore: Partial<ArticlesStore>;

  beforeEach(async () => {
    mockStore = {
      selectedArticle: signal(null),
      isLoading: signal(false),
      error: signal(null),
      loadArticleById: jest.fn(),
      createArticle: jest.fn(),
      updateArticle: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ArticleFormComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesStore, useValue: mockStore },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values for create mode', () => {
    fixture.detectChanges();
    expect(component.form.value).toEqual({
      title: '',
      content: ''
    });
  });

  it('should validate title as required', () => {
    const titleControl = component.form.get('title');
    expect(titleControl?.hasError('required')).toBe(true);

    titleControl?.setValue('Test');
    expect(titleControl?.hasError('required')).toBe(false);
  });

  it('should validate title min length', () => {
    const titleControl = component.form.get('title');
    titleControl?.setValue('Test');
    expect(titleControl?.hasError('minlength')).toBe(true);

    titleControl?.setValue('Test Article');
    expect(titleControl?.hasError('minlength')).toBe(false);
  });

  it('should validate content as required', () => {
    const contentControl = component.form.get('content');
    expect(contentControl?.hasError('required')).toBe(true);

    contentControl?.setValue('Test content');
    expect(contentControl?.hasError('required')).toBe(false);
  });

  it('should not submit invalid form', () => {
    component.form.setValue({ title: '', content: '' });
    component['onSubmit']();
    expect(mockStore.createArticle).not.toHaveBeenCalled();
  });
});
