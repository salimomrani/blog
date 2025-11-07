/**
 * Tag models based on API specification
 */

export interface TagDto {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name: string;
}

export interface ApiResponseTagDto {
  success: boolean;
  message: string;
  data: TagDto;
}

export interface ApiResponseListTagDto {
  success: boolean;
  message: string;
  data: TagDto[];
}
