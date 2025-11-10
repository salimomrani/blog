import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { ArticleDto, CreateArticleRequest, UpdateArticleRequest } from '../models/article.model';
import { ArticlesService, ArticleSearchParams } from '../services/articles.service';
import { LikesService } from '../services/likes.service';

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
    articlesService: inject(ArticlesService),
    likesService: inject(LikesService)
  })),
  withComputed((state) => ({
    articlesCount: computed(() => state.articles().length),
    hasArticles: computed(() => state.articles().length > 0)
  })),
  withMethods(({ articlesService, likesService, ...store }) => ({
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
     * Search articles with filters
     */
    searchArticles: rxMethod<ArticleSearchParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((params) => articlesService.search(params).pipe(
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
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la recherche';
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
     * Record a view for the given article
     */
    recordView: rxMethod<number>(
      pipe(
        switchMap((id) => articlesService.incrementViews(id).pipe(
          tap((response) => {
            if (!response.success) {
              throw new Error(response.message);
            }

            const updatedArticle = response.data;

            const updatedArticles = store.articles().map(article =>
              article.id === updatedArticle.id
                ? updatedArticle
                : article
            );

            const selectedArticle = store.selectedArticle();

            patchState(store, {
              articles: updatedArticles,
              selectedArticle: selectedArticle?.id === updatedArticle.id ? updatedArticle : selectedArticle
            });
          }),
          catchError(() => EMPTY)
        ))
      )
    ),

    /**
     * Toggle like on an article
     */
    toggleLike: rxMethod<number>(
      pipe(
        switchMap((articleId) => {
          // Read current state to determine the operation
          const currentArticles = store.articles();
          const currentSelectedArticle = store.selectedArticle();
          const article = currentArticles.find(a => a.id === articleId) ?? currentSelectedArticle;

          if (!article) {
            return EMPTY;
          }

          const isLiked = article.likedByCurrentUser;
          const operation = isLiked
            ? likesService.unlikeArticle(articleId)
            : likesService.likeArticle(articleId);

          return operation.pipe(
            tap(() => {
              // Read fresh state to handle any concurrent updates
              const latestArticles = store.articles();
              const latestSelectedArticle = store.selectedArticle();

              // Update the article in the articles list
              const updatedArticles = latestArticles.map(a => {
                if (a.id === articleId) {
                  return {
                    ...a,
                    likesCount: isLiked ? a.likesCount - 1 : a.likesCount + 1,
                    likedByCurrentUser: !isLiked
                  };
                }
                return a;
              });

              // Update selectedArticle if it's the same article
              const updatedSelectedArticle = latestSelectedArticle?.id === articleId
                ? {
                    ...latestSelectedArticle,
                    likesCount: isLiked ? latestSelectedArticle.likesCount - 1 : latestSelectedArticle.likesCount + 1,
                    likedByCurrentUser: !isLiked
                  }
                : latestSelectedArticle;

              patchState(store, {
                articles: updatedArticles,
                selectedArticle: updatedSelectedArticle
              });
            }),
            catchError((error) => {
              const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour du like';
              patchState(store, { error: errorMessage });
              return EMPTY;
            })
          );
        })
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
