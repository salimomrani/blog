import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateArticleRequest,
  UpdateArticleRequest,
  ApiResponseArticleDto,
  ApiResponseListArticleDto
} from '../models/article.model';

export interface ArticleSearchParams {
  query?: string;
  categoryId?: number;
  tagId?: number;
  authorId?: number;
}

/**
 * Service for managing articles with the backend API
 */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/articles`;

  /**
   * Get all articles
   */
  public getAll(): Observable<ApiResponseListArticleDto> {
    return this.http.get<ApiResponseListArticleDto>(this.baseUrl);
  }

  /**
   * Search articles with filters
   */
  public search(params: ArticleSearchParams): Observable<ApiResponseListArticleDto> {
    let httpParams = new HttpParams();

    if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }
    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }
    if (params.tagId) {
      httpParams = httpParams.set('tagId', params.tagId.toString());
    }
    if (params.authorId) {
      httpParams = httpParams.set('authorId', params.authorId.toString());
    }

    return this.http.get<ApiResponseListArticleDto>(`${this.baseUrl}/search`, { params: httpParams });
  }

  /**
   * Get article by ID
   */
  public getById(id: number): Observable<ApiResponseArticleDto> {
    return this.http.get<ApiResponseArticleDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new article
   */
  public create(article: CreateArticleRequest): Observable<ApiResponseArticleDto> {
    return this.http.post<ApiResponseArticleDto>(this.baseUrl, article);
  }

  /**
   * Update an existing article
   */
  public update(id: number, article: UpdateArticleRequest): Observable<ApiResponseArticleDto> {
    return this.http.put<ApiResponseArticleDto>(`${this.baseUrl}/${id}`, article);
  }

  /**
   * Delete an article
   */
  public delete(id: number): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.delete<{ success: boolean; message: string; data: unknown }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Increment article view counter
   */
  public incrementViews(id: number): Observable<ApiResponseArticleDto> {
    return this.http.post<ApiResponseArticleDto>(`${this.baseUrl}/${id}/views`, {});
  }
}
