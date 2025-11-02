# 03 — Spécifications Techniques

## 🏗️ Architecture générale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────┐
│            Frontend (Angular 20+)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Components│  │  Stores  │  │ Services │     │
│  │ (UI/UX)  │◄─┤  (NgRx)  │◄─┤  (HTTP)  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST
                     ▼
          ┌──────────────────────┐
          │ Backend (Spring Boot)│
          │   API REST + JWT     │
          └──────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  PostgreSQL  │
              │   Database   │
              └──────────────┘
```

### Flux de données

```
User Action → Component → Store (NgRx) → Service → HTTP → Backend API
                   ↑          ↓
                   └──── Signals (state updates)
```

---

## ⚙️ Stack technique

### Frontend (Angular)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Angular** | 20.3+ | Framework principal, Standalone Components |
| **TypeScript** | 5.9+ | Langage avec strict mode |
| **RxJS** | 7.8+ | Reactive programming |
| **NgRx Signals** | 20.1+ | State management global |
| **Angular Signals** | Natif | État local réactif |
| **TailwindCSS** | 3.x | Design system et styling |
| **SCSS** | - | Styles personnalisés complémentaires |
| **Jest** | Latest | Tests unitaires et intégration |
| **ESLint** | 9.x | Analyse statique du code |
| **Prettier** | Latest | Formatage de code |

### Backend (Spring Boot)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Spring Boot** | 3.x | Framework backend |
| **Java** | 17+ | Langage |
| **PostgreSQL** | 14+ | Base de données |
| **JWT** | - | Authentification stateless |
| **Spring Security** | 6.x | Sécurité et authentification |

### Infrastructure

| Technologie | Usage |
|-------------|-------|
| **Docker** | Conteneurisation des applications |
| **Kubernetes (EKS)** | Orchestration et déploiement |
| **GitHub Actions** | CI/CD pipeline |
| **AWS** | Cloud provider (EKS, ECR, ACM, Route53) |
| **NGINX Ingress** | Reverse proxy et load balancing |

---

## 📁 Structure du projet Angular

```
src/
├── app/
│   ├── features/              # Modules fonctionnels
│   │   ├── articles/
│   │   │   ├── article-list.component.ts
│   │   │   ├── article-detail.component.ts
│   │   │   ├── article-editor.component.ts
│   │   │   └── article-card.component.ts
│   │   ├── auth/
│   │   │   ├── login.component.ts
│   │   │   ├── register.component.ts
│   │   │   └── auth-guard.ts
│   │   ├── users/
│   │   │   ├── user-profile.component.ts
│   │   │   └── user-list.component.ts
│   │   └── comments/
│   │       └── comment-section.component.ts
│   │
│   ├── shared/                # Composants réutilisables
│   │   ├── components/
│   │   │   ├── navbar.component.ts
│   │   │   ├── footer.component.ts
│   │   │   ├── button.component.ts
│   │   │   ├── modal.component.ts
│   │   │   └── tag-chip.component.ts
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── article.model.ts
│   │       └── comment.model.ts
│   │
│   ├── services/              # Services HTTP
│   │   ├── articles.service.ts
│   │   ├── users.service.ts
│   │   ├── comments.service.ts
│   │   └── auth.service.ts
│   │
│   ├── store/                 # NgRx Stores
│   │   ├── articles.store.ts
│   │   ├── users.store.ts
│   │   ├── auth.store.ts
│   │   └── app.state.ts
│   │
│   ├── app.ts                 # Root component
│   ├── app.config.ts          # Configuration globale
│   └── app.routes.ts          # Routes
│
├── assets/                    # Images, fonts, etc.
├── styles/                    # Styles globaux
│   ├── tailwind.css
│   └── variables.scss
└── environments/              # Configuration par environnement
    ├── environment.ts
    └── environment.prod.ts
```

---

## 🧩 Architecture en couches

### 1. Presentation Layer (Components)

**Responsabilités :**
- Affichage de l'UI
- Gestion des interactions utilisateur
- Binding avec les stores via Signals
- Aucune logique métier

**Exemple :**
```typescript
@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './article-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleListComponent {
  readonly store = inject(ArticlesStore);

  ngOnInit() {
    this.store.loadArticles();
  }
}
```

### 2. State Management Layer (Stores)

**Responsabilités :**
- Gestion de l'état global
- Orchestration des services
- Calculs dérivés (computed)
- Gestion des états de chargement/erreur

**Exemple :**
```typescript
export const ArticlesStore = signalStore(
  { providedIn: 'root' },
  withState<ArticlesState>(initialState),
  withComputed((state) => ({
    featuredArticles: computed(() =>
      state.articles().filter(a => a.likes > 100)
    )
  })),
  withMethods((store, service = inject(ArticlesService)) => ({
    loadArticles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => service.getAll().pipe(
          tap(articles => patchState(store, { articles, isLoading: false })),
          catchError(error => {
            patchState(store, { error: error.message, isLoading: false });
            return EMPTY;
          })
        ))
      )
    )
  }))
);
```

### 3. Data Access Layer (Services)

**Responsabilités :**
- Communication HTTP avec le backend
- Transformation des données
- Gestion des headers (JWT)
- Mapping des DTOs

**Exemple :**
```typescript
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/articles';

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.baseUrl);
  }

  getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${slug}`);
  }

  create(article: CreateArticleDto): Observable<Article> {
    return this.http.post<Article>(this.baseUrl, article);
  }

  update(id: string, article: UpdateArticleDto): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/${id}`, article);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

## 🔐 Sécurité

### Authentification

**Méthode :** JWT (JSON Web Tokens)

**Flux :**
1. Login → Backend retourne `accessToken` + `refreshToken`
2. Stockage sécurisé dans `HttpOnly cookies` (recommandé) ou `localStorage`
3. Intercepteur HTTP ajoute le token dans le header `Authorization: Bearer {token}`
4. Refresh automatique du token avant expiration

**Implémentation :**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authStore.accessToken();

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req);
  }
}
```

### Autorisation

**Guards Angular :**
- `AuthGuard` : protège les routes nécessitant une authentification
- `AdminGuard` : restreint l'accès aux administrateurs
- `CanDeactivateGuard` : prévient la perte de données non sauvegardées

**Exemple :**
```typescript
export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
```

### Protection des données

- **XSS Protection** : Sanitization automatique Angular + CSP headers
- **CSRF Protection** : Tokens CSRF pour les mutations
- **CORS** : Configuration stricte côté backend
- **Validation** : Validation des formulaires côté client + backend
- **Secrets** : Variables d'environnement, jamais dans le code
- **HTTPS** : Obligatoire en production

---

## ⚡ Performance

### Objectifs de performance

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Core Web Vitals |
| **Bundle size (initial)** | < 200 KB | webpack-bundle-analyzer |
| **API response time** | < 300ms | Backend monitoring |

### Optimisations frontend

**1. Lazy Loading**
```typescript
export const routes: Routes = [
  {
    path: 'articles',
    loadComponent: () => import('./features/articles/article-list.component')
  }
];
```

**2. OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**3. trackBy dans les listes**
```html
@for (article of articles(); track article.id) {
  <app-article-card [article]="article" />
}
```

**4. Image optimization**
```html
<img ngSrc="/assets/hero.jpg"
     width="800"
     height="600"
     priority />
```

**5. Code splitting**
- Lazy loading des routes
- Dynamic imports pour les gros composants
- Preloading strategy personnalisée

**6. Caching**
- Service Worker pour les assets statiques
- HTTP cache headers
- Store cache pour éviter les appels API redondants

---

## 🧪 Stratégie de tests

### Tests unitaires (Jest)

**Couverture cible :** 80% minimum

**À tester :**
- **Components** : Rendu, interactions, bindings
- **Services** : Logique métier, appels HTTP
- **Stores** : Mutations d'état, computed values
- **Pipes** : Transformations de données
- **Guards** : Logique d'autorisation

**Exemple :**
```typescript
describe('ArticleListComponent', () => {
  it('should load articles on init', () => {
    const fixture = TestBed.createComponent(ArticleListComponent);
    const store = TestBed.inject(ArticlesStore);
    const loadSpy = jest.spyOn(store, 'loadArticles');

    fixture.detectChanges();

    expect(loadSpy).toHaveBeenCalled();
  });
});
```

### Tests d'intégration

- Tests de flux utilisateur complets
- Interaction entre plusieurs composants
- Navigation entre les pages

---

## 📋 Contraintes techniques

### Résolution d'écran

- **Mobile** : 320px - 767px
- **Tablet** : 768px - 1023px
- **Desktop** : 1024px+
---

## 📏 Normes et standards

### Code style (ESLint + Prettier)

**Règles principales :**
- Standalone components obligatoires
- `inject()` au lieu de constructor DI
- Explicit return types
- No `any` type
- Explicit accessibility modifiers
- trackBy obligatoire dans les loops

### Commits (Conventional Commits)

```
feat: add article editor component
fix: resolve authentication token refresh
docs: update API endpoint documentation
test: add unit tests for ArticlesStore
chore: update dependencies
```

### Branches Git

```
main (master)          → Production
├── develop            → Développement
├── feature/xxx        → Nouvelles fonctionnalités
├── fix/xxx            → Corrections de bugs
└── hotfix/xxx         → Corrections urgentes
```

### Pull Requests

**Checklist avant merge :**
- [ ] Tests passent (CI green)
- [ ] ESLint sans erreurs
- [ ] Couverture de tests maintenue
- [ ] Revue de code approuvée
- [ ] Documentation mise à jour

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test:coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build --configuration production

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/
```

---

## 🐳 Docker & Kubernetes

### Dockerfile (multi-stage)

```dockerfile
# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration production

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/blog/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment

- **Namespace** : `blog-frontend`
- **Replicas** : 3 (auto-scaling selon la charge)
- **Resources** :
  - Requests: CPU 100m, Memory 128Mi
  - Limits: CPU 500m, Memory 512Mi
- **Ingress** : ALB avec certificat ACM
- **Domain** : blog.kubevpro.i-consulting.shop

---

## 📚 Documentation

### Documentation code

- **TSDoc** pour les fonctions publiques
- README.md à jour
- Exemples d'usage dans `/docs/examples/`

### Documentation API

- Swagger/OpenAPI pour le backend
- Types TypeScript auto-générés depuis l'API

---

## 🎯 Prochaines étapes techniques

1. [ ] Setup initial du projet Angular 20
2. [ ] Configuration TailwindCSS
3. [ ] Configuration NgRx Signal Store
4. [ ] Setup Jest et configuration de tests
5. [ ] Configuration ESLint + Prettier
6. [ ] Création des modèles TypeScript
7. [ ] Implémentation des services HTTP
8. [ ] Création des stores NgRx
9. [ ] Développement des composants UI
10. [ ] Tests unitaires et intégration
11. [ ] Configuration CI/CD GitHub Actions
12. [ ] Déploiement Kubernetes
