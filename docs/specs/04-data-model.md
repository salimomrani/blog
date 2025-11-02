# 04 — Modèle de données (Front & Back)

## 🧠 Modèles principaux (TypeScript)
```ts
export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  tags: string[];
  author: Pick<User, 'id' | 'username' | 'avatarUrl'>;
  likes: number;
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: Pick<User, 'id' | 'username' | 'avatarUrl'>;
  content: string;
  createdAt: string;
}
