import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDto } from './auth.service';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'ADMIN' | 'USER' | 'MODERATOR';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: 'ADMIN' | 'USER' | 'MODERATOR';
  active?: boolean;
}

export interface ApiResponseUserDto {
  success: boolean;
  message: string;
  data: UserDto;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponseListUserDto {
  success: boolean;
  message: string;
  data: UserDto[];
}

/**
 * Service for managing users with the backend API
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/users';

  /**
   * Get all users (with pagination support)
   */
  public getAll(page = 0, size = 100): Observable<ApiResponseListUserDto> {
    return this.http.get<PageableResponse<UserDto>>(this.baseUrl, {
      params: { page: page.toString(), size: size.toString() }
    }).pipe(
      map(response => ({
        success: true,
        message: `${response.totalElements} utilisateur(s) trouvé(s)`,
        data: response.content
      }))
    );
  }

  /**
   * Get user by ID
   */
  public getById(id: number): Observable<ApiResponseUserDto> {
    return this.http.get<ApiResponseUserDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new user
   */
  public create(user: CreateUserRequest): Observable<ApiResponseUserDto> {
    return this.http.post<ApiResponseUserDto>(this.baseUrl, user);
  }

  /**
   * Update an existing user
   */
  public update(id: number, user: UpdateUserRequest): Observable<ApiResponseUserDto> {
    return this.http.put<ApiResponseUserDto>(`${this.baseUrl}/${id}`, user);
  }

  /**
   * Delete a user
   */
  public delete(id: number): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.delete<{ success: boolean; message: string; data: unknown }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Search users by query (name, email)
   */
  public search(query: string): Observable<ApiResponseListUserDto> {
    return this.http.get<ApiResponseListUserDto>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
  }

  /**
   * Filter users by role
   */
  public filterByRole(role: 'ADMIN' | 'USER' | 'MODERATOR'): Observable<ApiResponseListUserDto> {
    return this.http.get<ApiResponseListUserDto>(`${this.baseUrl}/role/${role}`);
  }
}
