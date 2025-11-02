# 02 — Spécifications fonctionnelles

## 🧩 Modules principaux
1. **Accueil** : liste des articles récents avec pagination et filtres.
2. **Article** : page de lecture, markdown, likes, commentaires.
3. **Authentification** : login, inscription, déconnexion.
4. **Éditeur** : création et édition d’un article (markdown + preview).
5. **Profil** : page publique d’un auteur + gestion de ses articles.
6. **Administration (futur)** : modération, gestion utilisateurs.

## 📄 User Stories (exemples)
### US-01 : Lire des articles
**En tant que** visiteur,  
**je veux** voir la liste des articles les plus récents,  
**afin de** naviguer dans le contenu publié.

**AC :**
- Pagination de 10 articles.
- Filtres par tag et recherche texte.
- Loader et message “Aucun article trouvé”.

### US-02 : Créer un article
**En tant qu’**utilisateur connecté,  
**je veux** pouvoir créer un article en markdown,  
**afin de** le partager avec la communauté.

**AC :**
- Formulaire titre, contenu, tags.
- Preview markdown live.
- Confirmation de publication.

(... ajoute les autres US ici)
