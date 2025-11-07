import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../shared/models/category.model';
import { CategoriesService } from '../services/categories.service';

export interface CategoriesState {
  categories: CategoryDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null
};

/**
 * NgRx Signal Store for managing categories state
 */
export const CategoriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    categoriesService: inject(CategoriesService)
  })),
  withComputed((state) => ({
    categoriesCount: computed(() => state.categories().length),
    hasCategories: computed(() => state.categories().length > 0)
  })),
  withMethods(({ categoriesService, ...store }) => ({
    /**
     * Load all categories
     */
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => categoriesService.getAll().pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                categories: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors du chargement des catégories';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Create a new category
     */
    createCategory: rxMethod<CreateCategoryRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((category) => categoriesService.create(category).pipe(
          tap((response) => {
            if (response.success) {
              const currentCategories = store.categories();
              patchState(store, {
                categories: [...currentCategories, response.data],
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la création de la catégorie';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Update an existing category
     */
    updateCategory: rxMethod<{ id: number; category: UpdateCategoryRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, category }) => categoriesService.update(id, category).pipe(
          tap((response) => {
            if (response.success) {
              const currentCategories = store.categories();
              const updatedCategories = currentCategories.map(c =>
                c.id === id ? response.data : c
              );
              patchState(store, {
                categories: updatedCategories,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour de la catégorie';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Delete a category
     */
    deleteCategory: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => categoriesService.delete(id).pipe(
          tap((response) => {
            if (response.success) {
              const currentCategories = store.categories();
              const filteredCategories = currentCategories.filter(c => c.id !== id);
              patchState(store, {
                categories: filteredCategories,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la suppression de la catégorie';
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
