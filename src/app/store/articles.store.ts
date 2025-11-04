import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { ArticleDto, CreateArticleRequest, UpdateArticleRequest } from '../models/article.model';
import { ArticlesService } from '../services/articles.service';

export interface ArticlesState {
  articles: ArticleDto[];
  selectedArticle: ArticleDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ArticlesState = {
  articles: [],
  selectedArticle: null,
  isLoading: false,
  error: null
};

/**
 * NgRx Signal Store for managing articles state
 */
export const ArticlesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    articlesService: inject(ArticlesService)
  })),
  withComputed((state) => ({
    articlesCount: computed(() => state.articles().length),
    hasArticles: computed(() => state.articles().length > 0)
  })),
  withMethods(({ articlesService, ...store }) => ({
    /**
     * Load all articles
     */
    loadArticles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => articlesService.getAll().pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                articles: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors du chargement des articles';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Load article by ID
     */
    loadArticleById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, selectedArticle: null })),
        switchMap((id) => articlesService.getById(id).pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                selectedArticle: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Article introuvable';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Create a new article
     */
    createArticle: rxMethod<CreateArticleRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((article) => articlesService.create(article).pipe(
          tap((response) => {
            if (response.success) {
              const currentArticles = store.articles();
              patchState(store, {
                articles: [...currentArticles, response.data],
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la création de l\'article';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Update an existing article
     */
    updateArticle: rxMethod<{ id: number; article: UpdateArticleRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, article }) => articlesService.update(id, article).pipe(
          tap((response) => {
            if (response.success) {
              const currentArticles = store.articles();
              const updatedArticles = currentArticles.map(a =>
                a.id === id ? response.data : a
              );
              patchState(store, {
                articles: updatedArticles,
                selectedArticle: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour de l\'article';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Delete an article
     */
    deleteArticle: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => articlesService.delete(id).pipe(
          tap((response) => {
            if (response.success) {
              const currentArticles = store.articles();
              const filteredArticles = currentArticles.filter(a => a.id !== id);
              patchState(store, {
                articles: filteredArticles,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la suppression de l\'article';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Clear selected article
     */
    clearSelectedArticle(): void {
      patchState(store, { selectedArticle: null });
    },

    /**
     * Clear error
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
