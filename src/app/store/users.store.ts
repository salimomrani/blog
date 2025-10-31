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
import { UsersService } from '../services/users.service';

// Re-export User types from service
export type { User, CreateUserDto, UpdateUserDto } from '../services/users.service';
import type { User } from '../services/users.service';

/**
 * Users state interface
 */
export interface UsersState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state for users
 */
const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

/**
 * Users Store using NgRx Signal Store
 *
 * Example usage in a component:
 * ```
 * export class UsersComponent {
 *   readonly store = inject(UsersStore);
 *
 *   ngOnInit() {
 *     this.store.loadUsers();
 *   }
 * }
 * ```
 */
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ users, isLoading }) => ({
    usersCount: computed(() => users().length),
    hasUsers: computed(() => users().length > 0),
    isEmpty: computed(() => users().length === 0 && !isLoading()),
    usersByRole: computed(() => {
      const usersList = users();
      const grouped: Record<string, User[]> = {};
      usersList.forEach((user) => {
        if (!grouped[user.role]) {
          grouped[user.role] = [];
        }
        grouped[user.role].push(user);
      });
      return grouped;
    }),
  })),
  withMethods((store, usersService = inject(UsersService)) => ({
    /**
     * Load all users from the backend
     */
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          usersService.getAll().pipe(
            tap((users: User[]) => patchState(store, { users, isLoading: false })),
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
     * Select a user by ID
     */
    selectUser(id: number): void {
      const user = store.users().find((u) => u.id === id) ?? null;
      patchState(store, { selectedUser: user });
    },

    /**
     * Clear selected user
     */
    clearSelection(): void {
      patchState(store, { selectedUser: null });
    },

    /**
     * Create a new user
     */
    createUser: rxMethod<Omit<User, 'id' | 'createdAt'>>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((newUser) =>
          usersService.create(newUser).pipe(
            tap((user: User) =>
              patchState(store, {
                users: [...store.users(), user],
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
     * Update an existing user
     */
    updateUser: rxMethod<User>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((user) =>
          usersService.update(user.id, user).pipe(
            tap((updatedUser: User) =>
              patchState(store, {
                users: store.users().map((u) => (u.id === updatedUser.id ? updatedUser : u)),
                selectedUser:
                  store.selectedUser()?.id === updatedUser.id ? updatedUser : store.selectedUser(),
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
     * Delete a user
     */
    deleteUser: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          usersService.delete(id).pipe(
            tap(() =>
              patchState(store, {
                users: store.users().filter((u) => u.id !== id),
                selectedUser: store.selectedUser()?.id === id ? null : store.selectedUser(),
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
     * Search users by username or email
     */
    searchUsers(query: string): User[] {
      const lowerQuery = query.toLowerCase();
      return store.users().filter(
        (user) =>
          user.username.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.firstName.toLowerCase().includes(lowerQuery) ||
          user.lastName.toLowerCase().includes(lowerQuery)
      );
    },

    /**
     * Get users by role
     */
    getUsersByRole(role: string): User[] {
      return store.users().filter((user) => user.role === role);
    },
  }))
);
