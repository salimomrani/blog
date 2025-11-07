/**
 * Comment models based on API specification
 */

export interface AuthorDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

export interface CommentDto {
  id: number;
  content: string;
  articleId: number;
  author: AuthorDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string; // minimum 1 character
  articleId: number;
}

export interface UpdateCommentRequest {
  content: string; // minimum 1 character
}

export interface ApiResponseCommentDto {
  success: boolean;
  message: string;
  data: CommentDto;
}

export interface ApiResponseListCommentDto {
  success: boolean;
  message: string;
  data: CommentDto[];
}
