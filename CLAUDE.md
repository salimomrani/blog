# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20.3 blog application using standalone components and Angular Signals. The project is configured to use both Angular Signals and NgRx with signal integration for state management.

## Key Technologies

- **Angular 20.3** with standalone components (no NgModules)
- **Angular Signals** - preferred reactivity primitive (already in use in src/app/app.ts:11)
- **NgRx with Signal Store** - for complex state management (to be integrated)
- **TypeScript 5.9** with strict mode enabled
- **Jasmine + Karma** for testing

## Backend API

This Angular application communicates with a **Spring Boot** backend:
- **Base URL**: `http://localhost:8080/api`
- All API calls should be prefixed with this base URL
- When creating services, use HttpClient and configure the base URL appropriately

**Available endpoints:**
- `/posts` - Blog posts management
- `/users` - User management

## Commands

### Development
```bash
npm start               # Start dev server (http://localhost:4200)
ng serve                # Alternative to npm start
```

### Build
```bash
npm run build           # Production build → dist/
ng build                # Same as npm run build
npm run watch           # Development build with watch mode
```

### Testing
```bash
npm test                # Run all tests with Karma
ng test                 # Same as npm test
ng test --include='**/path/to/file.spec.ts'  # Run single test file
```

### Linting
```bash
npm run lint            # Run ESLint on all files
ng lint                 # Same as npm run lint
npm run lint:fix        # Auto-fix ESLint errors where possible
ng lint --fix           # Same as npm run lint:fix
```

### Code Generation
```bash
ng generate component component-name    # Generate new component
ng generate --help                      # See all available schematics
```

## Architecture

### Application Bootstrap
- Entry point: `src/main.ts` - uses `bootstrapApplication()` (standalone component bootstrap)
- App config: `src/app/app.config.ts` - providers configured here including:
  - Zone-based change detection with event coalescing
  - Router configuration
  - Global error listeners

### Component Architecture
- **Standalone components only** - no NgModules
- Components use inline `imports: []` array for dependencies
- Root component: `App` class in `src/app/app.ts`
- Component selector prefix: `app-`

**Component File Structure:**
- **ALWAYS separate files** - do NOT use inline templates or styles
- Each component must have separate files:
  - `component-name.component.ts` - Component logic
  - `component-name.component.html` - Template
  - `component-name.component.scss` - Styles (use SCSS, not CSS)
- Use `templateUrl` and `styleUrl` properties, never `template` or `styles`
- Exception: Root `App` component may use separate files with shorter names (`app.ts`, `app.html`, `app.css`)

**Component Responsibilities:**
- Components should focus on presentation and user interaction
- Keep components thin - delegate business logic to services
- Use dependency injection to inject services
- Components should NOT contain HTTP calls directly

### Signal Usage Pattern
- Use Angular Signals for component state (see `src/app/app.ts:11` for example)
- Signals should be marked `protected readonly` when appropriate
- Signals provide reactive state without requiring zone-based change detection

### Services Architecture

**HTTP Services:**
- **ALWAYS create dedicated services for HTTP operations**
- Services should be placed in appropriate feature directories or `src/app/services/`
- Use `@Injectable({ providedIn: 'root' })` for singleton services
- Service naming: `feature-name.service.ts` (e.g., `users.service.ts`, `posts.service.ts`)

**Service Structure:**
```typescript
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  update(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

**Service Responsibilities:**
- Encapsulate all HTTP communication with backend
- Handle API endpoints and request/response mapping
- Provide clean, typed interfaces for data operations
- Return Observables for async operations
- Services can be injected into NgRx stores or components

**Layered Architecture:**
1. **Components** - Presentation and user interaction
2. **NgRx Stores** - State management and orchestration (inject services here)
3. **Services** - HTTP communication and data access
4. **Backend API** - Spring Boot REST API

### NgRx Integration
NgRx packages installed and configured (v20.1.0):
- `@ngrx/signals` - SignalStore for reactive state management
- `@ngrx/store` - Core store functionality
- `@ngrx/effects` - Side effects management
- `@ngrx/store-devtools` - Redux DevTools integration (enabled in dev mode)

**Store Configuration:**
- Global store configured in `src/app/app.config.ts` with `provideStore()`, `provideEffects()`, and `provideStoreDevtools()`
- Redux DevTools available in development mode (max 25 actions history)

**Store Structure:**
- Store files located in `src/app/store/`
- Global state interface: `src/app/store/app.state.ts`
- Feature stores:
  - `posts.store.ts` - Blog posts management (CRUD operations)
  - `users.store.ts` - User management (CRUD + search + role filtering)
- See `src/app/store/README.md` for detailed usage examples

**Signal Store Pattern:**
- Use `signalStore()` with `{ providedIn: 'root' }` for global stores
- Combine `withState()`, `withComputed()`, and `withMethods()` to build stores
- Use `rxMethod()` for async operations
- **Inject services into stores** - stores should call services, not HttpClient directly
- Inject stores directly in components via `inject(PostsStore)` or `inject(UsersStore)`
- Stores orchestrate service calls and manage state

**Store Pattern with Services:**
```typescript
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, usersService = inject(UsersService)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => usersService.getAll().pipe(
          tap((users) => patchState(store, { users, isLoading: false })),
          catchError((error) => {
            patchState(store, { error: error.message, isLoading: false });
            return of([]);
          })
        ))
      )
    ),
  }))
);
```

### TypeScript Configuration
- **Strict mode enabled** - all strict type checking flags are on
- `noImplicitReturns`, `noFallthroughCasesInSwitch` enforced
- `noPropertyAccessFromIndexSignature` - use bracket notation for dynamic properties
- Template type checking is strict (`strictTemplates: true`)

### Routing
- Routes defined in `src/app/app.routes.ts`
- Uses functional router configuration via `provideRouter()`
- Prefer lazy loading for feature routes using `loadComponent`

## Code Organization

### Project Structure
```
src/app/
├── features/           # Feature modules (lazy loaded)
│   ├── users/
│   │   ├── users.component.ts
│   │   ├── users.component.html
│   │   ├── users.component.scss
│   │   ├── users-list.component.ts
│   │   ├── users-list.component.html
│   │   ├── users-list.component.scss
│   │   └── user-form.component.ts
│   └── posts/
├── services/          # Shared services
│   ├── users.service.ts
│   └── posts.service.ts
├── store/             # NgRx stores
│   ├── users.store.ts
│   ├── posts.store.ts
│   └── app.state.ts
└── shared/            # Shared components, directives, pipes
```

### File Organization Rules

**Components:**
- Feature components in `src/app/features/{feature-name}/`
- Shared/reusable components in `src/app/shared/components/`
- Each component = 3 files minimum: `.ts`, `.html`, `.scss`

**Services:**
- Feature-specific services in `src/app/features/{feature-name}/`
- Shared services in `src/app/services/`
- Always use `@Injectable({ providedIn: 'root' })`

**Stores:**
- All stores in `src/app/store/`
- One store per feature (e.g., `users.store.ts`, `posts.store.ts`)
- Stores should inject and use services for HTTP operations

### File Naming Conventions
- Components: `feature-name.component.ts` (with `.html` and `.scss`)
- Services: `feature-name.service.ts`
- Stores: `feature-name.store.ts`
- Models/Interfaces: `feature-name.model.ts` or inline in service/store
- Use kebab-case for file names
- Use PascalCase for class names

## Code Style

### ESLint Configuration

**ESLint is configured with Angular best practices** (`eslint.config.js`)

**Key Angular Rules Enforced:**
- `@angular-eslint/no-inline-styles`: ❌ Inline styles are forbidden
- `@angular-eslint/prefer-standalone`: ✅ Standalone components required
- `@angular-eslint/use-injectable-provided-in`: ✅ Services must use `providedIn: 'root'`
- `@angular-eslint/no-empty-lifecycle-method`: ❌ No empty lifecycle hooks
- `@angular-eslint/use-lifecycle-interface`: ✅ Implement lifecycle interfaces
- Component selector prefix: `app-` in kebab-case
- Directive selector prefix: `app` in camelCase

**TypeScript Rules Enforced:**
- `@typescript-eslint/explicit-function-return-type`: ✅ Explicit return types required
- `@typescript-eslint/explicit-member-accessibility`: ✅ Explicit accessibility modifiers (public/private/protected)
- `@typescript-eslint/no-explicit-any`: ❌ `any` type is forbidden
- `@typescript-eslint/no-unused-vars`: ❌ No unused variables
- `@typescript-eslint/naming-convention`: ✅ Enforces naming conventions:
  - camelCase for variables, parameters, properties
  - PascalCase for classes, interfaces, types
  - UPPER_CASE for constants and enum members

**Template Rules Enforced:**
- `@angular-eslint/template/use-track-by-function`: ✅ trackBy required in @for loops
- `@angular-eslint/template/no-call-expression`: ❌ No function calls in templates
- `@angular-eslint/template/conditional-complexity`: Max 3 conditions
- `@angular-eslint/template/cyclomatic-complexity`: Max 5 complexity
- Accessibility rules enforced (ARIA, keyboard events, alt text)

**Code Quality Rules:**
- `prefer-const`: Use const for variables that don't change
- `no-var`: Use let/const instead of var
- `no-console`: Console.log warnings (error/warn allowed)

**Running ESLint:**
```bash
npm run lint           # Check for errors
npm run lint:fix       # Auto-fix errors
```

**VSCode Integration:**
Install the ESLint extension for real-time linting in the editor.

### Prettier Configuration
The project uses Prettier with these settings:
- Print width: 100 characters
- Single quotes preferred
- Angular parser for HTML templates

**Note:** Run Prettier before committing. ESLint handles code quality, Prettier handles formatting.

### Naming Conventions
- Root component class named `App` (not `AppComponent`)
- Follow Angular style guide for other components, services, etc.

## Best Practices Summary

### Code Quality
1. ✅ **Run ESLint before committing**: `npm run lint`
2. ✅ Use `npm run lint:fix` to auto-fix issues
3. ✅ Follow ESLint rules - they enforce best practices
4. ✅ Use explicit types - avoid `any`
5. ✅ Add accessibility modifiers (public/private/protected)

### When Creating Components
1. ✅ **ALWAYS create separate files**: `.ts`, `.html`, `.scss`
2. ✅ Use `templateUrl` and `styleUrl` (never inline `template` or `styles`)
3. ✅ Keep components thin - focus on presentation
4. ✅ Inject stores or services for data operations
5. ❌ **NEVER put HTTP calls directly in components**
6. ✅ Implement lifecycle interfaces (OnInit, OnDestroy, etc.)
7. ✅ Use trackBy in @for loops

### When Creating Services
1. ✅ **ALWAYS create services for HTTP operations**
2. ✅ Use `@Injectable({ providedIn: 'root' })`
3. ✅ Inject `HttpClient` using `inject(HttpClient)`
4. ✅ Return typed Observables (`Observable<User[]>`)
5. ✅ One service per feature (UsersService, PostsService)

### When Creating Stores
1. ✅ Create stores in `src/app/store/`
2. ✅ **Inject services into stores** - use services for HTTP
3. ✅ Use `rxMethod()` for async operations
4. ✅ Manage state, loading, and error states
5. ❌ **NEVER inject HttpClient directly in stores** - use services instead

### Architecture Flow
```
Component → Store → Service → HTTP → Backend API
   ↑         ↑        ↑
   UI     State    Data Access
```

### Example Implementation
```typescript
// ✅ CORRECT: Service handles HTTP
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  getAll() { return this.http.get<User[]>('api/users'); }
}

// ✅ CORRECT: Store uses service
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withMethods((store, service = inject(UsersService)) => ({
    load: rxMethod(() => service.getAll().pipe(...))
  }))
);

// ✅ CORRECT: Component uses store
export class UsersComponent {
  readonly store = inject(UsersStore);
  ngOnInit() { this.store.load(); }
}

// ❌ WRONG: Component with direct HTTP call
export class UsersComponent {
  readonly http = inject(HttpClient); // ❌ NO!
  ngOnInit() { this.http.get('api/users').subscribe(...); } // ❌ NO!
}
```
