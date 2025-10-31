# Store

Ce dossier contient la gestion d'état de l'application avec NgRx Signal Store.

## Structure

- **app.state.ts** - Interface de l'état global de l'application
- **posts.store.ts** - Store des posts du blog
- **users.store.ts** - Store de gestion des utilisateurs
- **index.ts** - Exports centralisés

## Utilisation du Signal Store

### Posts Store - Exemple

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PostsStore } from './store';

@Component({
  selector: 'app-posts',
  template: `
    <div>
      @if (store.isLoading()) {
        <p>Chargement...</p>
      }

      @if (store.error()) {
        <p>Erreur: {{ store.error() }}</p>
      }

      @for (post of store.posts(); track post.id) {
        <article>
          <h2>{{ post.title }}</h2>
          <p>{{ post.content }}</p>
        </article>
      }

      <p>Total: {{ store.postsCount() }} posts</p>
    </div>
  `
})
export class PostsComponent implements OnInit {
  readonly store = inject(PostsStore);

  ngOnInit() {
    // Charger les posts au démarrage
    this.store.loadPosts();
  }

  onAddPost() {
    this.store.addPost({
      title: 'Nouveau post',
      content: 'Contenu du post',
      author: 'John Doe'
    });
  }

  onDeletePost(id: number) {
    this.store.deletePost(id);
  }
}
```

### Users Store - Gestion des utilisateurs

Le UsersStore offre une gestion complète des utilisateurs avec CRUD:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { UsersStore } from './store';

@Component({
  selector: 'app-users',
  template: `
    <div>
      @if (store.isLoading()) {
        <p>Chargement...</p>
      }

      @if (store.error()) {
        <p class="error">{{ store.error() }}</p>
      }

      <div class="stats">
        <p>Total utilisateurs: {{ store.usersCount() }}</p>
      </div>

      @for (user of store.users(); track user.id) {
        <div class="user-card">
          <h3>{{ user.firstName }} {{ user.lastName }}</h3>
          <p>Username: {{ user.username }}</p>
          <p>Email: {{ user.email }}</p>
          <p>Role: {{ user.role }}</p>
          <button (click)="onSelectUser(user.id)">Sélectionner</button>
          <button (click)="onDeleteUser(user.id)">Supprimer</button>
        </div>
      }

      @if (store.selectedUser(); as user) {
        <div class="selected-user">
          <h4>Utilisateur sélectionné: {{ user.username }}</h4>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  readonly store = inject(UsersStore);

  ngOnInit() {
    // Charger les utilisateurs au démarrage
    this.store.loadUsers();
  }

  onSelectUser(id: number) {
    this.store.selectUser(id);
  }

  onCreateUser() {
    this.store.createUser({
      username: 'jdoe',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER'
    });
  }

  onUpdateUser() {
    const user = this.store.selectedUser();
    if (user) {
      this.store.updateUser({
        ...user,
        firstName: 'Jane'
      });
    }
  }

  onDeleteUser(id: number) {
    this.store.deleteUser(id);
  }

  // Méthodes utilitaires
  searchUsers(query: string) {
    return this.store.searchUsers(query);
  }

  getUsersByRole(role: string) {
    return this.store.getUsersByRole(role);
  }
}
```

**Fonctionnalités du UsersStore:**
- ✅ `loadUsers()` - Charger tous les utilisateurs depuis `/users`
- ✅ `createUser(user)` - Créer un nouvel utilisateur
- ✅ `updateUser(user)` - Mettre à jour un utilisateur existant
- ✅ `deleteUser(id)` - Supprimer un utilisateur
- ✅ `selectUser(id)` - Sélectionner un utilisateur
- ✅ `clearSelection()` - Effacer la sélection
- ✅ `searchUsers(query)` - Rechercher par username, email, prénom ou nom
- ✅ `getUsersByRole(role)` - Filtrer par rôle

**Computed signals:**
- `usersCount` - Nombre total d'utilisateurs
- `hasUsers` - Booléen indiquant si des utilisateurs existent
- `isEmpty` - Booléen indiquant si la liste est vide
- `usersByRole` - Utilisateurs groupés par rôle

## Créer un nouveau Store

Pour créer un nouveau feature store, suivez le pattern de `posts.store.ts`:

```typescript
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

// 1. Définir l'interface de l'état
interface MyFeatureState {
  data: any[];
  isLoading: boolean;
  error: string | null;
}

// 2. État initial
const initialState: MyFeatureState = {
  data: [],
  isLoading: false,
  error: null,
};

// 3. Créer le store
export const MyFeatureStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ data }) => ({
    dataCount: computed(() => data().length),
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    loadData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http.get<any[]>('http://localhost:8080/api/my-endpoint').pipe(
            tap((data: any[]) => patchState(store, { data, isLoading: false })),
            catchError((error: Error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of([]);
            })
          )
        )
      )
    ),
  }))
);
```

## API Backend

Toutes les requêtes HTTP sont faites vers le backend Spring Boot:
- **Base URL**: `http://localhost:8080/api`

**Endpoints disponibles:**
- Posts:
  - `GET /posts` - Liste tous les posts
  - `POST /posts` - Créer un post
  - `PUT /posts/:id` - Mettre à jour un post
  - `DELETE /posts/:id` - Supprimer un post

- Users:
  - `GET /users` - Liste tous les utilisateurs
  - `POST /users` - Créer un utilisateur
  - `PUT /users/:id` - Mettre à jour un utilisateur
  - `DELETE /users/:id` - Supprimer un utilisateur
