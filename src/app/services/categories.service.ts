import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponseCategoryDto,
  ApiResponseListCategoryDto
} from '../shared/models/category.model';

/**
 * Service for managing categories with the backend API
 */
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/categories`;

  /**
   * Get all categories
   */
  public getAll(): Observable<ApiResponseListCategoryDto> {
    return this.http.get<ApiResponseListCategoryDto>(this.baseUrl);
  }

  /**
   * Get category by ID
   */
  public getById(id: number): Observable<ApiResponseCategoryDto> {
    return this.http.get<ApiResponseCategoryDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new category
   */
  public create(category: CreateCategoryRequest): Observable<ApiResponseCategoryDto> {
    return this.http.post<ApiResponseCategoryDto>(this.baseUrl, category);
  }

  /**
   * Update an existing category
   */
  public update(id: number, category: UpdateCategoryRequest): Observable<ApiResponseCategoryDto> {
    return this.http.put<ApiResponseCategoryDto>(`${this.baseUrl}/${id}`, category);
  }

  /**
   * Delete a category
   */
  public delete(id: number): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.delete<{ success: boolean; message: string; data: unknown }>(`${this.baseUrl}/${id}`);
  }
}
