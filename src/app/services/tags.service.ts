import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateTagRequest,
  UpdateTagRequest,
  ApiResponseTagDto,
  ApiResponseListTagDto
} from '../shared/models/tag.model';

/**
 * Service for managing tags with the backend API
 */
@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/tags`;

  /**
   * Get all tags
   */
  public getAll(): Observable<ApiResponseListTagDto> {
    return this.http.get<ApiResponseListTagDto>(this.baseUrl);
  }

  /**
   * Get tag by ID
   */
  public getById(id: number): Observable<ApiResponseTagDto> {
    return this.http.get<ApiResponseTagDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new tag
   */
  public create(tag: CreateTagRequest): Observable<ApiResponseTagDto> {
    return this.http.post<ApiResponseTagDto>(this.baseUrl, tag);
  }

  /**
   * Update an existing tag
   */
  public update(id: number, tag: UpdateTagRequest): Observable<ApiResponseTagDto> {
    return this.http.put<ApiResponseTagDto>(`${this.baseUrl}/${id}`, tag);
  }

  /**
   * Delete a tag
   */
  public delete(id: number): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.delete<{ success: boolean; message: string; data: unknown }>(`${this.baseUrl}/${id}`);
  }
}
