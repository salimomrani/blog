# Google Analytics 4 - Guide de Configuration

Ce guide explique comment configurer et utiliser Google Analytics 4 (GA4) pour tracker le trafic et les événements de votre application Angular.

## 📋 Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Obtenir votre Measurement ID](#obtenir-votre-measurement-id)
3. [Activer le tracking](#activer-le-tracking)
4. [Événements trackés automatiquement](#événements-trackés-automatiquement)
5. [Ajouter des événements personnalisés](#ajouter-des-événements-personnalisés)
6. [Visualiser les données](#visualiser-les-données)
7. [Mode développement vs production](#mode-développement-vs-production)

---

## Configuration initiale

### 1. Obtenir votre Measurement ID

Le Measurement ID est nécessaire pour connecter votre application à Google Analytics. Voici comment l'obtenir:

#### Étape 1: Créer un compte Google Analytics
1. Visitez [Google Analytics](https://analytics.google.com/)
2. Cliquez sur "Commencer" ou "Créer un compte"
3. Suivez les étapes pour créer votre compte

#### Étape 2: Créer une propriété GA4
1. Dans Admin (⚙️), cliquez sur "Créer une propriété"
2. Donnez un nom à votre propriété (ex: "Blog Application")
3. Sélectionnez votre fuseau horaire et devise
4. Cliquez sur "Suivant"

#### Étape 3: Configurer le flux de données
1. Sélectionnez "Web" comme plateforme
2. Entrez l'URL de votre site (ex: `https://blog.kubevpro.i-consulting.shop`)
3. Donnez un nom au flux (ex: "Blog Frontend")
4. Cliquez sur "Créer un flux"

#### Étape 4: Copier le Measurement ID
1. Une fois le flux créé, vous verrez votre **Measurement ID**
2. Format: `G-XXXXXXXXXX` (commence toujours par `G-`)
3. Copiez cet ID

### 2. Activer le tracking

#### Configuration pour le développement
Éditez `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  baseUrl: 'http://localhost:8080',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  },
  googleAnalyticsId: 'G-XXXXXXXXXX' // ⬅️ Collez votre Measurement ID ici
};
```

#### Configuration pour la production
Éditez `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  baseUrl: 'https://backend.kubevpro.i-consulting.shop',
  apiPrefix: '/api/v1',
  get baseApiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  },
  googleAnalyticsId: 'G-XXXXXXXXXX' // ⬅️ Collez votre Measurement ID ici
};
```

> **Note**: Vous pouvez utiliser le même Measurement ID pour dev et prod, ou créer deux flux de données séparés pour distinguer les environnements.

### 3. Vérifier l'installation

1. Démarrez votre application: `npm start`
2. Ouvrez votre navigateur sur `http://localhost:4200`
3. Allez dans Google Analytics → Rapports → Temps réel
4. Vous devriez voir votre session active apparaître en temps réel

---

## Événements trackés automatiquement

### Événements d'authentification

| Événement | Déclenché quand | Paramètres |
|-----------|-----------------|------------|
| `login` | Connexion réussie | `method: 'email'` |
| `sign_up` | Inscription réussie | `method: 'email'` |
| `logout` | Déconnexion | - |

### Événements d'articles

| Événement | Déclenché quand | Paramètres |
|-----------|-----------------|------------|
| `article_view` | Consultation d'un article | `article_id`, `article_title` |
| `article_create` | Création d'un article | `article_id`, `article_title` |
| `article_like` | Like d'un article | `article_id` |
| `article_unlike` | Unlike d'un article | `article_id` |

### Navigation automatique

Google Analytics 4 track automatiquement:
- **page_view**: Chaque changement de page/route
- **first_visit**: Première visite d'un utilisateur
- **session_start**: Début de session
- **user_engagement**: Engagement utilisateur

---

## Ajouter des événements personnalisés

### Utiliser le service Analytics

Injectez le service `AnalyticsService` dans votre composant:

```typescript
import { inject } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

export class MyComponent {
  private readonly analyticsService = inject(AnalyticsService);

  onCustomAction(): void {
    // Tracker un événement personnalisé
    this.analyticsService.trackEvent('button_click', {
      button_name: 'download',
      page: 'home'
    });
  }
}
```

### Méthodes disponibles

```typescript
// Authentification
trackLogin(method: 'email'): void
trackSignUp(method: 'email'): void
trackLogout(): void

// Articles
trackArticleCreate(articleId: number, title: string): void
trackArticleView(articleId: number, title: string): void
trackArticleLike(articleId: number): void
trackArticleUnlike(articleId: number): void

// Commentaires
trackCommentCreate(articleId: number, commentId: number): void

// Recherche
trackSearch(searchTerm: string): void

// Profil
trackProfileUpdate(): void

// Événement générique
trackEvent(eventName: string, params?: Record<string, unknown>): void
```

### Exemples d'utilisation

#### Tracker un clic sur un bouton
```typescript
onShareArticle(): void {
  this.analyticsService.trackEvent('share_article', {
    article_id: this.article.id,
    share_method: 'twitter'
  });
}
```

#### Tracker une recherche
```typescript
onSearch(query: string): void {
  this.analyticsService.trackSearch(query);
}
```

#### Tracker un téléchargement
```typescript
onDownload(fileName: string): void {
  this.analyticsService.trackEvent('file_download', {
    file_name: fileName,
    file_type: fileName.split('.').pop()
  });
}
```

---

## Visualiser les données

### Rapports en temps réel

1. Google Analytics → **Rapports** → **Temps réel**
2. Vous verrez:
   - Utilisateurs actifs en ce moment
   - Pages consultées en direct
   - Événements déclenchés en temps réel
   - Sources de trafic actuelles

### Rapports principaux

#### Vue d'ensemble
- **Rapports** → **Vue d'ensemble des rapports**
- Résumé des métriques clés: utilisateurs, sessions, durée moyenne

#### Acquisition
- **Rapports** → **Acquisition** → **Vue d'ensemble**
- Sources de trafic: direct, organique, réseaux sociaux, référents

#### Engagement
- **Rapports** → **Engagement** → **Événements**
- Liste tous les événements déclenchés
- Nombre d'occurrences par événement
- Valeur moyenne des événements

#### Pages et écrans
- **Rapports** → **Engagement** → **Pages et écrans**
- Pages les plus visitées
- Durée moyenne par page
- Taux de sortie

### Créer des rapports personnalisés

1. **Explorer** → **Créer une nouvelle exploration**
2. Sélectionnez les dimensions et métriques:
   - **Dimensions**: Event name, Page path, Device category, Country
   - **Métriques**: Event count, Total users, Sessions, Engagement rate
3. Créez des segments pour filtrer les données

### Exemples de rapports utiles

#### Rapport des articles les plus populaires
- **Dimension**: Event parameter: article_title
- **Métrique**: Event count (article_view)
- **Filtre**: Event name = article_view

#### Rapport de conversion (inscription)
- **Entonnoir**: Home → Login → Sign up
- **Taux de conversion**: sign_up / page_view

#### Rapport de rétention
- **Cohortes** → Utilisateurs par date de première visite
- Voir combien reviennent après 1 jour, 7 jours, 30 jours

---

## Mode développement vs production

### Séparer les environnements

Pour ne pas polluer vos statistiques de production avec les tests en développement:

#### Option 1: Deux Measurement IDs (recommandé)
Créez deux flux de données dans GA4:

```typescript
// environment.ts (dev)
googleAnalyticsId: 'G-DEV12345'

// environment.prod.ts (prod)
googleAnalyticsId: 'G-PROD67890'
```

#### Option 2: Un seul ID avec filtres
Utilisez le même ID mais créez des vues filtrées:
1. Dans GA4, créez une **audience** "Production Traffic"
2. Filtre: Hostname contains "kubevpro"
3. Excluez "localhost"

### Désactiver le tracking en développement

Si vous voulez désactiver complètement le tracking en dev:

```typescript
// environment.ts
googleAnalyticsId: '' // ⬅️ Laissez vide pour désactiver
```

Le tracking ne sera activé que si `googleAnalyticsId` est défini (voir `app.config.ts:55`).

---

## Métriques importantes à surveiller

### Trafic
- **Utilisateurs actifs** (jour/semaine/mois)
- **Nouvelles vs anciennes sessions**
- **Taux de rebond** (sessions avec 1 seule page vue)
- **Durée moyenne des sessions**

### Engagement
- **Pages par session**
- **Événements par utilisateur**
- **Articles les plus vus**
- **Articles les plus likés**

### Conversions
- **Taux d'inscription** (sign_up / page_view)
- **Utilisateurs actifs après inscription**
- **Articles créés par utilisateur inscrit**

### Performance
- **Pages avec taux de sortie élevé** (à optimiser)
- **Pages avec longue durée** (contenu engageant)
- **Chemins de navigation** (comment les users naviguent)

---

## Bonnes pratiques

### 1. Nommage des événements
- Utilisez `snake_case` pour les noms d'événements (ex: `article_view`, pas `ArticleView`)
- Soyez cohérent avec la convention Google Analytics
- Utilisez des noms descriptifs et courts

### 2. Paramètres d'événements
- Limitez à 25 paramètres par événement max
- Nommez les paramètres en `snake_case`
- Évitez les données sensibles (emails, mots de passe)

### 3. Respect de la vie privée
- **Ne trackez JAMAIS**:
  - Informations personnelles identifiables (email, nom complet)
  - Mots de passe
  - Tokens d'authentification
  - Données de paiement
- Respectez le RGPD et les réglementations locales
- Ajoutez une politique de confidentialité

### 4. Performance
- Les événements sont envoyés de manière asynchrone
- Pas d'impact sur les performances de l'application
- Google Analytics batche les événements automatiquement

---

## Dépannage

### Problème: Aucune donnée dans GA4

**Solutions**:
1. Vérifiez que le Measurement ID est correct (format `G-XXXXXXXXXX`)
2. Vérifiez que le Measurement ID est dans `environment.ts` / `environment.prod.ts`
3. Ouvrez la console du navigateur, cherchez des erreurs liées à `gtag` ou `analytics`
4. Vérifiez que les bloqueurs de publicité sont désactivés (ils bloquent GA4)
5. Attendez 24-48h pour les rapports non temps réel

### Problème: Données en dev mais pas en prod

**Solutions**:
1. Vérifiez que `environment.prod.ts` contient le bon Measurement ID
2. Vérifiez que le build de production utilise le bon fichier d'environnement
3. Testez avec `npm run build && npx http-server dist/blog`

### Problème: Événements personnalisés non visibles

**Solutions**:
1. Les événements personnalisés peuvent prendre 24-48h pour apparaître dans les rapports
2. Utilisez le **Temps réel** pour voir les événements immédiatement
3. Vérifiez que le nom de l'événement respecte les conventions (snake_case, max 40 caractères)

---

## Ressources supplémentaires

- [Documentation officielle GA4](https://support.google.com/analytics/answer/9306384)
- [Événements recommandés par Google](https://support.google.com/analytics/answer/9267735)
- [ngx-google-analytics sur GitHub](https://github.com/maxandriani/ngx-google-analytics)
- [GA4 Academy (formations gratuites)](https://analytics.google.com/analytics/academy/)

---

## Support

Pour toute question ou problème:
1. Vérifiez d'abord ce guide
2. Consultez la [documentation ngx-google-analytics](https://github.com/maxandriani/ngx-google-analytics)
3. Consultez la [communauté Google Analytics](https://support.google.com/analytics/community)
