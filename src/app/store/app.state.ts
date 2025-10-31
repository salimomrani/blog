import { PostsState } from './posts.store';
import { UsersState } from './users.store';

/**
 * Global application state interface
 * Add feature states here as the application grows
 */
export interface AppState {
  posts: PostsState;
  users: UsersState;
}
