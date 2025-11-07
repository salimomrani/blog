import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateCommentRequest,
  UpdateCommentRequest,
  ApiResponseCommentDto,
  ApiResponseListCommentDto
} from '../shared/models/comment.model';

/**
 * Service for managing comments with the backend API
 */
@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/comments`;

  /**
   * Get all comments for a specific article
   */
  public getByArticleId(articleId: number): Observable<ApiResponseListCommentDto> {
    return this.http.get<ApiResponseListCommentDto>(`${this.baseUrl}/article/${articleId}`);
  }

  /**
   * Get comment by ID
   */
  public getById(id: number): Observable<ApiResponseCommentDto> {
    return this.http.get<ApiResponseCommentDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new comment
   */
  public create(comment: CreateCommentRequest): Observable<ApiResponseCommentDto> {
    return this.http.post<ApiResponseCommentDto>(this.baseUrl, comment);
  }

  /**
   * Update an existing comment
   */
  public update(id: number, comment: UpdateCommentRequest): Observable<ApiResponseCommentDto> {
    return this.http.put<ApiResponseCommentDto>(`${this.baseUrl}/${id}`, comment);
  }

  /**
   * Delete a comment
   */
  public delete(id: number): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.delete<{ success: boolean; message: string; data: unknown }>(`${this.baseUrl}/${id}`);
  }
}
