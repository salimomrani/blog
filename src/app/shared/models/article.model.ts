import { UserPreview } from './user.model';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  tags: string[];
  author: UserPreview;
  likes: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  tags: string[];
}

export interface UpdateArticleDto {
  title?: string;
  excerpt?: string;
  contentMarkdown?: string;
  coverImageUrl?: string;
  tags?: string[];
}
