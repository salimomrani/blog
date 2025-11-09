/**
 * Article models based on OpenAPI specification
 */

import { CategoryDto } from '../shared/models/category.model';
import { TagDto } from '../shared/models/tag.model';

export interface AuthorDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

export interface ArticleDto {
  id: number;
  title: string;
  content: string;
  author: AuthorDto;
  categories?: CategoryDto[];
  tags?: TagDto[];
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface CreateArticleRequest {
  title: string; // 5-200 characters
  content: string; // minimum 10 characters
  categoryIds?: number[]; // optional category IDs
  tagIds?: number[]; // optional tag IDs
}

export interface UpdateArticleRequest {
  title?: string; // 5-200 characters, optional
  content?: string; // minimum 10 characters, optional
  authorId?: number; // optional, to change author
  categoryIds?: number[]; // optional category IDs
  tagIds?: number[]; // optional tag IDs
}

export interface ApiResponseArticleDto {
  success: boolean;
  message: string;
  data: ArticleDto;
}

export interface ApiResponseListArticleDto {
  success: boolean;
  message: string;
  data: ArticleDto[];
}
