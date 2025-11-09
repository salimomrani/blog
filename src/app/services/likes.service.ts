import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service for managing article likes
 * Handles like/unlike operations with Spring Boot backend
 */
@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/articles`;

  /**
   * Like an article
   * @param articleId - The ID of the article to like
   * @returns Observable<void>
   */
  public likeArticle(articleId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${articleId}/like`, {});
  }

  /**
   * Unlike an article
   * @param articleId - The ID of the article to unlike
   * @returns Observable<void>
   */
  public unlikeArticle(articleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${articleId}/like`);
  }
}
