export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type UserPreview = Pick<User, 'id' | 'username' | 'avatarUrl'>;
