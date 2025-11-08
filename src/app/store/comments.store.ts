import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { CommentDto, CreateCommentRequest, UpdateCommentRequest } from '../shared/models/comment.model';
import { CommentsService } from '../services/comments.service';

export interface CommentsState {
  comments: CommentDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  isLoading: false,
  error: null
};

/**
 * NgRx Signal Store for managing comments state
 */
export const CommentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    commentsService: inject(CommentsService)
  })),
  withComputed((state) => ({
    commentsCount: computed(() => state.comments().length),
    hasComments: computed(() => state.comments().length > 0),
    nestedComments: computed(() => {
      const comments = state.comments();
      const commentMap = new Map<number, CommentDto>(comments.map(comment => [comment.id, { ...comment, replies: [] }]));
      const rootComments: CommentDto[] = [];

      for (const comment of comments) {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies?.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      }

      return rootComments;
    })
  })),
  withMethods(({ commentsService, ...store }) => ({
    /**
     * Load comments for a specific article
     */
    loadCommentsByArticleId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((articleId) => commentsService.getByArticleId(articleId).pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                comments: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors du chargement des commentaires';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Create a new comment
     */
    createComment: rxMethod<CreateCommentRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((comment) => commentsService.create(comment).pipe(
          tap((response) => {
            if (response.success) {
              const currentComments = store.comments();
              patchState(store, {
                comments: [...currentComments, response.data],
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la création du commentaire';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Update an existing comment
     */
    updateComment: rxMethod<{ id: number; comment: UpdateCommentRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, comment }) => commentsService.update(id, comment).pipe(
          tap((response) => {
            if (response.success) {
              const currentComments = store.comments();
              const updatedComments = currentComments.map(c =>
                c.id === id ? { ...c, ...response.data } : c
              );
              patchState(store, {
                comments: updatedComments,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour du commentaire';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Delete a comment
     */
    deleteComment: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => commentsService.delete(id).pipe(
          tap((response) => {
            if (response.success) {
              const currentComments = store.comments();
              const commentsToDelete = new Set<number>([id]);
              const queue = [id];

              while (queue.length > 0) {
                const parentId = queue.shift()!;
                currentComments.forEach(comment => {
                  if (comment.parentId === parentId) {
                    commentsToDelete.add(comment.id);
                    queue.push(comment.id);
                  }
                });
              }

              const filteredComments = currentComments.filter(c => !commentsToDelete.has(c.id));
              patchState(store, {
                comments: filteredComments,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la suppression du commentaire';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Clear comments
     */
    clearComments(): void {
      patchState(store, { comments: [] });
    },

    /**
     * Clear error
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
