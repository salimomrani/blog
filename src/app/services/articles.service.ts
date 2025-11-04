import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateArticleRequest,
  UpdateArticleRequest,
  ApiResponseArticleDto,
  ApiResponseListArticleDto
} from '../models/article.model';

/**
 * Service for managing articles with the backend API
 */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/articles';

  /**
   * Get all articles
   */
  public getAll(): Observable<ApiResponseListArticleDto> {
    return this.http.get<ApiResponseListArticleDto>(this.baseUrl);
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
}
