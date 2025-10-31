import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { PostsService } from '../services/posts.service';

// Re-export Post types from service
export type { Post, CreatePostDto, UpdatePostDto } from '../services/posts.service';
import type { Post } from '../services/posts.service';

/**
 * Posts state interface
 */
export interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state for posts
 */
const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,
};

/**
 * Posts Store using NgRx Signal Store
 *
 * Example usage in a component:
 * ```
 * export class PostsComponent {
 *   readonly store = inject(PostsStore);
 *
 *   ngOnInit() {
 *     this.store.loadPosts();
 *   }
 * }
 * ```
 */
export const PostsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ posts, isLoading }) => ({
    postsCount: computed(() => posts().length),
    hasPosts: computed(() => posts().length > 0),
    isEmpty: computed(() => posts().length === 0 && !isLoading()),
  })),
  withMethods((store, postsService = inject(PostsService)) => ({
    /**
     * Load all posts from the backend
     */
    loadPosts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          postsService.getAll().pipe(
            tap((posts: Post[]) => patchState(store, { posts, isLoading: false })),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                isLoading: false,
              });
              return of([]);
            })
          )
        )
      )
    ),

    /**
     * Select a post by ID
     */
    selectPost(id: number): void {
      const post = store.posts().find((p) => p.id === id) ?? null;
      patchState(store, { selectedPost: post });
    },

    /**
     * Clear selected post
     */
    clearSelection(): void {
      patchState(store, { selectedPost: null });
    },

    /**
     * Add a new post
     */
    addPost: rxMethod<Omit<Post, 'id' | 'createdAt'>>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((newPost) =>
          postsService.create(newPost).pipe(
            tap((post: Post) =>
              patchState(store, {
                posts: [...store.posts(), post],
                isLoading: false,
              })
            ),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                isLoading: false,
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Update an existing post
     */
    updatePost: rxMethod<Post>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((post) =>
          postsService.update(post.id, post).pipe(
            tap((updatedPost: Post) =>
              patchState(store, {
                posts: store.posts().map((p) => (p.id === updatedPost.id ? updatedPost : p)),
                isLoading: false,
              })
            ),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                isLoading: false,
              });
              return of(null);
            })
          )
        )
      )
    ),

    /**
     * Delete a post
     */
    deletePost: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          postsService.delete(id).pipe(
            tap(() =>
              patchState(store, {
                posts: store.posts().filter((p) => p.id !== id),
                isLoading: false,
              })
            ),
            catchError((error: Error) => {
              patchState(store, {
                error: error.message,
                isLoading: false,
              });
              return of(null);
            })
          )
        )
      )
    ),
  }))
);
