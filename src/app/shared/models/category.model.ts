/**
 * Category models based on API specification
 */

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface ApiResponseCategoryDto {
  success: boolean;
  message: string;
  data: CategoryDto;
}

export interface ApiResponseListCategoryDto {
  success: boolean;
  message: string;
  data: CategoryDto[];
}
