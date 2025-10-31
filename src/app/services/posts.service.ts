import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export type CreatePostDto = Omit<Post, 'id' | 'createdAt'>;
export type UpdatePostDto = Partial<CreatePostDto>;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/posts';

  /**
   * Get all posts from the backend
   */
  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  /**
   * Get a single post by ID
   */
  getById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new post
   */
  create(post: CreatePostDto): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, post);
  }

  /**
   * Update an existing post
   */
  update(id: number, post: UpdatePostDto): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, post);
  }

  /**
   * Delete a post
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
