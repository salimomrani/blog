# GitHub Branch Protection Rules

Ce guide explique comment configurer les **Branch Protection Rules** pour empêcher le merge d'une Pull Request si les tests échouent.

## 🎯 Objectif

Bloquer le merge sur la branche `master` si :
- ❌ Les tests échouent
- ❌ Le lint échoue
- ❌ Le build échoue

## 📋 Configuration des Branch Protection Rules

### Étape 1 : Accéder aux paramètres du repository

1. Allez sur votre repository GitHub : https://github.com/salimomrani/blog
2. Cliquez sur **Settings** (⚙️)
3. Dans le menu de gauche, cliquez sur **Branches**

### Étape 2 : Créer une règle de protection

1. Cliquez sur **Add branch protection rule**
2. Dans **Branch name pattern**, entrez : `master` (ou `main`)

### Étape 3 : Configurer les règles

Cochez les options suivantes :

#### ✅ Require a pull request before merging
- Cette option force l'utilisation de PR (pas de push direct sur master)
- Vous pouvez aussi cocher **Require approvals** si vous voulez exiger des reviews

#### ✅ Require status checks to pass before merging
**C'est l'option la plus importante pour bloquer le merge si les tests échouent**

1. Cochez cette option
2. Cochez **Require branches to be up to date before merging**
3. Dans le champ de recherche, cherchez : **Build and Test**
4. Sélectionnez le check **Build and Test** (c'est le nom du job dans votre workflow CI/CD)

#### ✅ Autres options recommandées (optionnelles)

- **Require conversation resolution before merging** : Force la résolution des commentaires
- **Do not allow bypassing the above settings** : Empêche les admins de bypass les règles
- **Require linear history** : Force un historique git linéaire

### Étape 4 : Sauvegarder

Cliquez sur **Create** ou **Save changes** en bas de la page.

---

## 🔍 Comment ça fonctionne

### Workflow CI/CD
Votre workflow `.github/workflows/ci.yml` s'exécute automatiquement :

```yaml
on:
  pull_request:
    branches: [ master, main ]
```

Le job **Build and Test** exécute :
1. ✅ **ESLint** : Vérifie la qualité du code
2. ✅ **Tests** : Exécute tous les tests Jest
3. ✅ **Build** : Compile l'application Angular

### Sur une Pull Request

Lorsque vous créez ou mettez à jour une PR :

1. GitHub Actions démarre automatiquement le workflow CI/CD
2. Le job "Build and Test" s'exécute
3. GitHub affiche le statut dans la PR :
   - 🟢 **All checks have passed** → Vous pouvez merger
   - 🔴 **Some checks were not successful** → **Le bouton "Merge" est désactivé**

### Exemple de PR avec checks

```
✅ Build and Test — Passed in 2m 15s
   ✓ Run ESLint
   ✓ Run tests with coverage
   ✓ Build application
```

Si un check échoue :
```
❌ Build and Test — Failed in 1m 30s
   ✓ Run ESLint
   ❌ Run tests with coverage (2 tests failed)
   ✗ Build application (not run)
```

Le bouton **Merge pull request** sera **désactivé** ❌

---

## 🧪 Tester la configuration

### Test 1 : PR avec tests passants (devrait permettre le merge)

```bash
git checkout -b test/passing-tests
# Faire des modifications qui ne cassent pas les tests
git add .
git commit -m "test: all tests passing"
git push origin test/passing-tests
# Créer une PR sur GitHub
```

Résultat attendu : ✅ Bouton "Merge" activé

### Test 2 : PR avec tests échouants (devrait bloquer le merge)

```bash
git checkout -b test/failing-tests
# Modifier un test pour le faire échouer
# Par exemple dans src/app/app.spec.ts :
# expect(true).toBe(false);
git add .
git commit -m "test: intentionally failing test"
git push origin test/failing-tests
# Créer une PR sur GitHub
```

Résultat attendu : ❌ Bouton "Merge" désactivé avec message d'erreur

---

## 📊 Statut des checks dans la PR

Une fois configuré, chaque PR affichera :

### Dans l'onglet "Checks"
```
Build and Test
├── Run ESLint
├── Run tests with coverage
│   ├── App > should create the component ✓
│   ├── App > should render the title ✓
│   ├── ... (all tests)
└── Build application
```

### Dans l'onglet "Conversation"
```
This branch has no conflicts with the base branch
Merging can be performed automatically.

✅ All checks have passed
   1 successful check

☑️ This branch is up to date with the base branch

[Merge pull request ▼]  (bouton vert activé)
```

---

## 🔧 Troubleshooting

### Le check n'apparaît pas dans les options

**Cause** : Le workflow n'a jamais été exécuté sur une PR

**Solution** : Créez une PR de test pour déclencher le workflow, puis configurez la protection

### Le bouton Merge est toujours accessible malgré les checks échoués

**Cause** : La règle de protection n'est pas activée ou mal configurée

**Solution** : Vérifiez que vous avez bien coché **"Require status checks to pass before merging"**

### Les admins peuvent toujours merger malgré les checks échoués

**Cause** : Les admins peuvent bypass les règles par défaut

**Solution** : Cochez **"Do not allow bypassing the above settings"**

---

## 📝 Résumé

| Configuration | Obligatoire | Description |
|---------------|-------------|-------------|
| Branch protection rule sur `master` | ✅ | Active la protection |
| Require status checks to pass | ✅ | Bloque si checks échouent |
| Select check: "Build and Test" | ✅ | Le job à vérifier |
| Require PR before merging | 🔶 Recommandé | Force l'usage de PR |
| Require approvals | ⚪ Optionnel | Reviews obligatoires |

---

## 🎉 Après configuration

Une fois configuré, **vous ne pourrez plus merger une PR si** :
- ❌ Les tests Jest échouent
- ❌ ESLint trouve des erreurs
- ❌ Le build Angular échoue

Cela garantit que seul du code de qualité est mergé sur `master` ! 🚀

---

**Documentation GitHub officielle :**
https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
