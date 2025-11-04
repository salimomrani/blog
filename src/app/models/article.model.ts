/**
 * Article models based on OpenAPI specification
 */

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  title: string; // 5-200 characters
  content: string; // minimum 10 characters
}

export interface UpdateArticleRequest {
  title?: string; // 5-200 characters, optional
  content?: string; // minimum 10 characters, optional
  authorId?: number; // optional, to change author
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
