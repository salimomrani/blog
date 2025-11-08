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
  parentId?: number;
  replies?: CommentDto[];
}

export interface CreateCommentRequest {
  content: string; // minimum 1 character
  articleId: number;
  parentId?: number;
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
