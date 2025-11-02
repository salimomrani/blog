---

### 🔗 `docs/specs/05-api-endpoints.md`
```markdown
# 05 — Endpoints API

## 🔐 Auth
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Connexion utilisateur |
| POST | `/auth/refresh` | Renouveler les tokens |

## 📰 Articles
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/articles` | Lister les articles |
| GET | `/articles/:slug` | Détails d’un article |
| POST | `/articles` | Créer un article |
| PUT | `/articles/:id` | Modifier un article |
| DELETE | `/articles/:id` | Supprimer un article |

## 💬 Commentaires
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/articles/:id/comments` | Liste des commentaires |
| POST | `/articles/:id/comments` | Ajouter un commentaire |

## 👤 Utilisateurs
| Méthode | Endpoint | Description |
|----------|-----------|-------------|
| GET | `/users/:username` | Voir le profil public |
| GET | `/me/articles` | Voir mes articles |
