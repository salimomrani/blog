import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { computed } from '@angular/core';
import { UserDto } from '../services/auth.service';
import { UsersService, CreateUserRequest, UpdateUserRequest } from '../services/users.service';

export interface UsersState {
  users: UserDto[];
  selectedUser: UserDto | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  roleFilter: 'ALL' | 'ADMIN' | 'USER' | 'MODERATOR';
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  roleFilter: 'ALL'
};

/**
 * NgRx Signal Store for managing users state
 */
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    usersService: inject(UsersService)
  })),
  withComputed((state) => ({
    usersCount: computed(() => state.users().length),
    hasUsers: computed(() => state.users().length > 0),
    filteredUsers: computed(() => {
      let users = state.users();
      const query = state.searchQuery().toLowerCase();
      const role = state.roleFilter();

      // Filter by role
      if (role !== 'ALL') {
        users = users.filter(u => u.role === role);
      }

      // Filter by search query
      if (query) {
        users = users.filter(u =>
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      }

      return users;
    }),
    adminUsers: computed(() => state.users().filter(u => u.role === 'ADMIN')),
    activeUsers: computed(() => state.users().filter(u => u.active))
  })),
  withMethods(({ usersService, ...store }) => ({
    /**
     * Load all users
     */
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => usersService.getAll().pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                users: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors du chargement des utilisateurs';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Load user by ID
     */
    loadUserById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null, selectedUser: null })),
        switchMap((id) => usersService.getById(id).pipe(
          tap((response) => {
            if (response.success) {
              patchState(store, {
                selectedUser: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Utilisateur introuvable';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Create a new user
     */
    createUser: rxMethod<CreateUserRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((user) => usersService.create(user).pipe(
          tap((response) => {
            if (response.success) {
              const currentUsers = store.users();
              patchState(store, {
                users: [...currentUsers, response.data],
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la création de l\'utilisateur';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Update an existing user
     */
    updateUser: rxMethod<{ id: number; user: UpdateUserRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, user }) => usersService.update(id, user).pipe(
          tap((response) => {
            if (response.success) {
              const currentUsers = store.users();
              const updatedUsers = currentUsers.map(u =>
                u.id === id ? response.data : u
              );
              patchState(store, {
                users: updatedUsers,
                selectedUser: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la mise à jour de l\'utilisateur';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Delete a user
     */
    deleteUser: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => usersService.delete(id).pipe(
          tap((response) => {
            if (response.success) {
              const currentUsers = store.users();
              const filteredUsers = currentUsers.filter(u => u.id !== id);
              patchState(store, {
                users: filteredUsers,
                isLoading: false
              });
            } else {
              throw new Error(response.message);
            }
          }),
          catchError((error) => {
            const errorMessage = error?.error?.message ?? error?.message ?? 'Erreur lors de la suppression de l\'utilisateur';
            patchState(store, { error: errorMessage, isLoading: false });
            return EMPTY;
          })
        ))
      )
    ),

    /**
     * Set search query
     */
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },

    /**
     * Set role filter
     */
    setRoleFilter(role: 'ALL' | 'ADMIN' | 'USER' | 'MODERATOR'): void {
      patchState(store, { roleFilter: role });
    },

    /**
     * Clear selected user
     */
    clearSelectedUser(): void {
      patchState(store, { selectedUser: null });
    },

    /**
     * Clear error
     */
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
