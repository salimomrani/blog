# API Specification - Backend Requirements

## 📋 Vue d'ensemble

Ce document décrit les endpoints nécessaires pour le système de commentaires, catégories et tags du blog.

---

## 🔐 Authentification

- Tous les endpoints nécessitent un header `Authorization: Bearer <token>` sauf mention contraire
- Les endpoints marqués **[ADMIN]** nécessitent le rôle `ADMIN`
- Les endpoints marqués **[PUBLIC]** sont accessibles sans authentification

---

## 💬 API Commentaires

Base URL: `/api/v1/comments`

### 1. GET `/api/v1/comments/article/{articleId}` **[PUBLIC]**

Récupère tous les commentaires d'un article.

**Réponse:**
```json
{
  "success": true,
  "message": "Commentaires récupérés avec succès",
  "data": [
    {
      "id": 1,
      "content": "Super article !",
      "articleId": 5,
      "author": {
        "id": 2,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "fullName": "John Doe"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. GET `/api/v1/comments/{id}` **[PUBLIC]**

Récupère un commentaire par ID.

**Réponse:**
```json
{
  "success": true,
  "message": "Commentaire récupéré avec succès",
  "data": {
    "id": 1,
    "content": "Super article !",
    "articleId": 5,
    "author": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "fullName": "John Doe"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 3. POST `/api/v1/comments` **[AUTHENTICATED]**

Crée un nouveau commentaire.

**Requête:**
```json
{
  "content": "Super article !",
  "articleId": 5
}
```

**Validation:**
- `content`: requis, min 1 caractère
- `articleId`: requis, doit exister

**Réponse:**
```json
{
  "success": true,
  "message": "Commentaire créé avec succès",
  "data": {
    "id": 1,
    "content": "Super article !",
    "articleId": 5,
    "author": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "fullName": "John Doe"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 4. PUT `/api/v1/comments/{id}` **[AUTHENTICATED]**

Met à jour un commentaire existant.

**Permission:** Seul l'auteur peut modifier son commentaire.

**Requête:**
```json
{
  "content": "Article vraiment excellent !"
}
```

**Validation:**
- `content`: requis, min 1 caractère

**Réponse:**
```json
{
  "success": true,
  "message": "Commentaire mis à jour avec succès",
  "data": {
    "id": 1,
    "content": "Article vraiment excellent !",
    "articleId": 5,
    "author": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "fullName": "John Doe"
    },
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:35:00Z"
  }
}
```

---

### 5. DELETE `/api/v1/comments/{id}` **[AUTHENTICATED]**

Supprime un commentaire.

**Permission:** Seul l'auteur ou un admin peut supprimer le commentaire.

**Réponse:**
```json
{
  "success": true,
  "message": "Commentaire supprimé avec succès",
  "data": null
}
```

---

## 📂 API Catégories

Base URL: `/api/v1/categories`

### 1. GET `/api/v1/categories` **[PUBLIC]**

Récupère toutes les catégories.

**Réponse:**
```json
{
  "success": true,
  "message": "Catégories récupérées avec succès",
  "data": [
    {
      "id": 1,
      "name": "Frontend",
      "slug": "frontend",
      "description": "Articles sur le développement frontend",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Backend",
      "slug": "backend",
      "description": "Articles sur le développement backend",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### 2. GET `/api/v1/categories/{id}` **[PUBLIC]**

Récupère une catégorie par ID.

**Réponse:**
```json
{
  "success": true,
  "message": "Catégorie récupérée avec succès",
  "data": {
    "id": 1,
    "name": "Frontend",
    "slug": "frontend",
    "description": "Articles sur le développement frontend",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-10T08:00:00Z"
  }
}
```

---

### 3. POST `/api/v1/categories` **[ADMIN]**

Crée une nouvelle catégorie.

**Requête:**
```json
{
  "name": "Frontend",
  "description": "Articles sur le développement frontend"
}
```

**Validation:**
- `name`: requis, min 2 caractères, max 50 caractères, unique
- `description`: optionnel
- `slug`: généré automatiquement depuis `name` (ex: "Frontend" → "frontend")

**Réponse:**
```json
{
  "success": true,
  "message": "Catégorie créée avec succès",
  "data": {
    "id": 1,
    "name": "Frontend",
    "slug": "frontend",
    "description": "Articles sur le développement frontend",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-10T08:00:00Z"
  }
}
```

---

### 4. PUT `/api/v1/categories/{id}` **[ADMIN]**

Met à jour une catégorie existante.

**Requête:**
```json
{
  "name": "Frontend Development",
  "description": "Articles sur le développement frontend moderne"
}
```

**Validation:**
- `name`: optionnel, min 2 caractères, max 50 caractères, unique
- `description`: optionnel
- `slug`: régénéré automatiquement si `name` est modifié

**Réponse:**
```json
{
  "success": true,
  "message": "Catégorie mise à jour avec succès",
  "data": {
    "id": 1,
    "name": "Frontend Development",
    "slug": "frontend-development",
    "description": "Articles sur le développement frontend moderne",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
```

---

### 5. DELETE `/api/v1/categories/{id}` **[ADMIN]**

Supprime une catégorie.

**Note:** Vérifier qu'aucun article n'utilise cette catégorie, ou dissocier automatiquement.

**Réponse:**
```json
{
  "success": true,
  "message": "Catégorie supprimée avec succès",
  "data": null
}
```

---

## 🏷️ API Tags

Base URL: `/api/v1/tags`

### 1. GET `/api/v1/tags` **[PUBLIC]**

Récupère tous les tags.

**Réponse:**
```json
{
  "success": true,
  "message": "Tags récupérés avec succès",
  "data": [
    {
      "id": 1,
      "name": "Angular",
      "slug": "angular",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "name": "TypeScript",
      "slug": "typescript",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### 2. GET `/api/v1/tags/{id}` **[PUBLIC]**

Récupère un tag par ID.

**Réponse:**
```json
{
  "success": true,
  "message": "Tag récupéré avec succès",
  "data": {
    "id": 1,
    "name": "Angular",
    "slug": "angular",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-10T08:00:00Z"
  }
}
```

---

### 3. POST `/api/v1/tags` **[ADMIN]**

Crée un nouveau tag.

**Requête:**
```json
{
  "name": "Angular"
}
```

**Validation:**
- `name`: requis, min 2 caractères, max 30 caractères, unique
- `slug`: généré automatiquement depuis `name` (ex: "Angular" → "angular")

**Réponse:**
```json
{
  "success": true,
  "message": "Tag créé avec succès",
  "data": {
    "id": 1,
    "name": "Angular",
    "slug": "angular",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-10T08:00:00Z"
  }
}
```

---

### 4. PUT `/api/v1/tags/{id}` **[ADMIN]**

Met à jour un tag existant.

**Requête:**
```json
{
  "name": "Angular Framework"
}
```

**Validation:**
- `name`: requis, min 2 caractères, max 30 caractères, unique
- `slug`: régénéré automatiquement si `name` est modifié

**Réponse:**
```json
{
  "success": true,
  "message": "Tag mis à jour avec succès",
  "data": {
    "id": 1,
    "name": "Angular Framework",
    "slug": "angular-framework",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
```

---

### 5. DELETE `/api/v1/tags/{id}` **[ADMIN]**

Supprime un tag.

**Note:** Vérifier qu'aucun article n'utilise ce tag, ou dissocier automatiquement.

**Réponse:**
```json
{
  "success": true,
  "message": "Tag supprimé avec succès",
  "data": null
}
```

---

## 📝 Modifications des Articles

### GET `/api/v1/articles`

**Modifier la réponse pour inclure `categories` et `tags`:**

```json
{
  "success": true,
  "message": "Articles récupérés avec succès",
  "data": [
    {
      "id": 1,
      "title": "Introduction à Angular 20",
      "content": "<p>Contenu de l'article...</p>",
      "author": {
        "id": 2,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "fullName": "John Doe"
      },
      "categories": [
        {
          "id": 1,
          "name": "Frontend",
          "slug": "frontend",
          "description": "Articles sur le développement frontend",
          "createdAt": "2025-01-10T08:00:00Z",
          "updatedAt": "2025-01-10T08:00:00Z"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "Angular",
          "slug": "angular",
          "createdAt": "2025-01-10T08:00:00Z",
          "updatedAt": "2025-01-10T08:00:00Z"
        },
        {
          "id": 2,
          "name": "TypeScript",
          "slug": "typescript",
          "createdAt": "2025-01-10T08:00:00Z",
          "updatedAt": "2025-01-10T08:00:00Z"
        }
      ],
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/v1/articles/{id}`

**Même format que ci-dessus avec `categories` et `tags`.**

---

### POST `/api/v1/articles`

**Ajouter les champs optionnels dans la requête:**

```json
{
  "title": "Introduction à Angular 20",
  "content": "<p>Contenu de l'article...</p>",
  "categoryIds": [1, 2],
  "tagIds": [1, 2, 3]
}
```

**Validation:**
- `categoryIds`: optionnel, tableau d'IDs de catégories existantes
- `tagIds`: optionnel, tableau d'IDs de tags existants

**Réponse:** Article créé avec `categories` et `tags` inclus.

---

### PUT `/api/v1/articles/{id}`

**Ajouter les champs optionnels dans la requête:**

```json
{
  "title": "Introduction à Angular 20 - Mise à jour",
  "content": "<p>Contenu mis à jour...</p>",
  "categoryIds": [1],
  "tagIds": [1, 2, 4]
}
```

**Validation:**
- `categoryIds`: optionnel, tableau d'IDs de catégories existantes
- `tagIds`: optionnel, tableau d'IDs de tags existants
- Si fournis, remplace complètement les associations existantes

**Réponse:** Article mis à jour avec `categories` et `tags` inclus.

---

## 🗄️ Modèle de Données

### Table: `comments`

```sql
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    article_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### Table: `categories`

```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Table: `tags`

```sql
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL UNIQUE,
    slug VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Table: `article_categories` (Many-to-Many)

```sql
CREATE TABLE article_categories (
    article_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, category_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

---

### Table: `article_tags` (Many-to-Many)

```sql
CREATE TABLE article_tags (
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## 🔒 Gestion des Permissions

### Commentaires
- **Lecture:** Tous (public)
- **Création:** Utilisateurs authentifiés
- **Modification:** Auteur uniquement
- **Suppression:** Auteur ou Admin

### Catégories
- **Lecture:** Tous (public)
- **Création/Modification/Suppression:** Admin uniquement

### Tags
- **Lecture:** Tous (public)
- **Création/Modification/Suppression:** Admin uniquement

---

## ⚠️ Gestion d'Erreurs

Tous les endpoints doivent retourner des erreurs au format:

```json
{
  "success": false,
  "message": "Message d'erreur descriptif",
  "data": null
}
```

**Codes HTTP:**
- `200`: Succès
- `201`: Création réussie
- `400`: Erreur de validation
- `401`: Non authentifié
- `403`: Non autorisé
- `404`: Ressource non trouvée
- `500`: Erreur serveur

---

## 📊 Exemples d'Erreurs

### Validation échouée
```json
{
  "success": false,
  "message": "Le nom de la catégorie est requis",
  "data": null
}
```

### Permission refusée
```json
{
  "success": false,
  "message": "Vous n'êtes pas autorisé à modifier ce commentaire",
  "data": null
}
```

### Ressource non trouvée
```json
{
  "success": false,
  "message": "Article introuvable",
  "data": null
}
```

---

## ✅ Checklist d'Implémentation

- [ ] Créer les tables de base de données
- [ ] Implémenter les endpoints de commentaires (5 endpoints)
- [ ] Implémenter les endpoints de catégories (5 endpoints)
- [ ] Implémenter les endpoints de tags (5 endpoints)
- [ ] Modifier les endpoints articles pour inclure categories/tags
- [ ] Implémenter la génération automatique des slugs
- [ ] Implémenter les vérifications de permissions
- [ ] Ajouter les validations de données
- [ ] Gérer les cascades de suppression
- [ ] Tester tous les endpoints avec Postman/Insomnia
