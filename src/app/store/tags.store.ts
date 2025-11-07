import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { TagDto, CreateTagRequest, UpdateTagRequest } from '../shared/models/tag.model';
import { TagsService } from '../services/tags.service';

export interface TagsState {
  tags: TagDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  isLoading: false,
  error: null
};

/**
 * NgRx Signal Store for managing tags state
 */
export const TagsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    tagsService: inject(TagsService)
  })),
  withComputed((state) => ({
    tagsCount: computed(() => state.tags().length),
    hasTags: computed(() => state.tags().length > 0)
  })),
  withMethods(({ tagsService, ...store }) => ({
    /**
     * Load all tags
     */
    loadTags: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => tagsService.getAll().pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                tags: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors du chargement des tags';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Create a new tag
     */
    createTag: rxMethod<CreateTagRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((tag) => tagsService.create(tag).pipe(
          tap((response) => {
            if (response.success) {
              const currentTags = store.tags();
              patchState(store, {
                tags: [...currentTags, response.data],
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la création du tag';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Update an existing tag
     */
    updateTag: rxMethod<{ id: number; tag: UpdateTagRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, tag }) => tagsService.update(id, tag).pipe(
          tap((response) => {
            if (response.success) {
              const currentTags = store.tags();
              const updatedTags = currentTags.map(t =>
                t.id === id ? response.data : t
              );
              patchState(store, {
                tags: updatedTags,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour du tag';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Delete a tag
     */
    deleteTag: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => tagsService.delete(id).pipe(
          tap((response) => {
            if (response.success) {
              const currentTags = store.tags();
              const filteredTags = currentTags.filter(t => t.id !== id);
              patchState(store, {
                tags: filteredTags,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la suppression du tag';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Clear error
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
