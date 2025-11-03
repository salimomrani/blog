import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

export interface ApiResponseAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  active: boolean;
  role: 'ADMIN' | 'USER' | 'MODERATOR';
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export interface ApiResponseUserDto {
  success: boolean;
  message: string;
  data: UserDto;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/auth`;

  login(payload: LoginRequestDto): Observable<ApiResponseAuthResponse> {
    return this.http.post<ApiResponseAuthResponse>(`${this.baseUrl}/login`, payload);
  }

  register(payload: RegisterRequestDto): Observable<ApiResponseAuthResponse> {
    return this.http.post<ApiResponseAuthResponse>(`${this.baseUrl}/register`, payload);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  me(): Observable<ApiResponseUserDto> {
    return this.http.get<ApiResponseUserDto>(`${this.baseUrl}/me`);
  }

  refresh(refreshToken: string): Observable<ApiResponseAuthResponse> {
    return this.http.post<ApiResponseAuthResponse>(`${this.baseUrl}/refresh?refreshToken=${refreshToken}`, {});
  }
}


