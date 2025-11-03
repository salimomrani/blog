# GitHub Actions Setup Guide

## Configuration des Secrets GitHub

Pour que le workflow fonctionne, vous devez configurer votre `KUBECONFIG` dans les secrets GitHub.

### 1. Récupérer votre kubeconfig

Sur votre serveur Kubernetes :

```bash
# Option 1: Copier votre kubeconfig existant
cat ~/.kube/config

# Option 2: Créer un service account dédié (recommandé pour la production)
kubectl create serviceaccount github-actions -n default
kubectl create clusterrolebinding github-actions-admin \
  --clusterrole=cluster-admin \
  --serviceaccount=default:github-actions
```

### 2. Ajouter le secret dans GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**
4. Nom : `KUBECONFIG`
5. Valeur : Collez le contenu complet de votre kubeconfig
6. Cliquez sur **Add secret**

### 3. Format du kubeconfig

Votre kubeconfig doit ressembler à :

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: LS0tLS...
    server: https://your-k8s-api-server:6443
  name: your-cluster
contexts:
- context:
    cluster: your-cluster
    user: your-user
  name: your-context
current-context: your-context
users:
- name: your-user
  user:
    client-certificate-data: LS0tLS...
    client-key-data: LS0tLS...
```

## Utilisation

### Déploiement automatique

Le workflow se déclenche automatiquement à chaque push sur `master` ou `main`.

```bash
git add .
git commit -m "Deploy application"
git push origin master
```

### Déploiement manuel

Vous pouvez aussi déclencher le workflow manuellement :

1. Allez sur **Actions** dans votre repository GitHub
2. Sélectionnez le workflow **Deploy to Kubernetes**
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche
5. Cliquez sur **Run workflow**

## Sécurité - Service Account dédié (Production)

Pour la production, créez un service account avec des permissions limitées :

```bash
# Créer un namespace dédié
kubectl create namespace blog-frontend

# Créer un service account
kubectl create serviceaccount github-deployer -n blog-frontend

# Créer un role avec permissions limitées
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: github-deployer
  namespace: blog-frontend
rules:
- apiGroups: ["", "apps", "networking.k8s.io"]
  resources: ["deployments", "services", "ingresses", "pods", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["cert-manager.io"]
  resources: ["certificates", "certificaterequests", "issuers"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
EOF

# Créer le rolebinding
kubectl create rolebinding github-deployer \
  --role=github-deployer \
  --serviceaccount=blog-frontend:github-deployer \
  -n blog-frontend

# Récupérer le token
kubectl create token github-deployer -n blog-frontend --duration=87600h

# Créer un kubeconfig pour ce service account
CLUSTER_NAME=$(kubectl config view --minify -o jsonpath='{.clusters[0].name}')
API_SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
TOKEN=$(kubectl create token github-deployer -n blog-frontend --duration=87600h)

cat <<EOF > github-kubeconfig.yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: $(kubectl config view --raw --minify --flatten -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
    server: $API_SERVER
  name: $CLUSTER_NAME
contexts:
- context:
    cluster: $CLUSTER_NAME
    namespace: blog-frontend
    user: github-deployer
  name: github-deployer@$CLUSTER_NAME
current-context: github-deployer@$CLUSTER_NAME
users:
- name: github-deployer
  user:
    token: $TOKEN
EOF

# Utilisez le contenu de github-kubeconfig.yaml dans le secret KUBECONFIG
cat github-kubeconfig.yaml
```

## Surveillance du déploiement

### Vérifier les logs GitHub Actions

1. Allez sur **Actions** dans votre repository
2. Cliquez sur le workflow en cours
3. Consultez les logs de chaque étape

### Vérifier sur le cluster

```bash
# Vérifier les pods cert-manager
kubectl get pods -n cert-manager

# Vérifier les certificates
kubectl get certificate

# Vérifier l'ingress
kubectl get ingress blog-frontend-ingress

# Décrire le certificat
kubectl describe certificate blog-frontend-tls-cert

# Tester HTTPS
curl -I https://blog.kubevpro.i-consulting.shop
```

## Dépannage

### Le certificat n'est pas émis

```bash
# Vérifier les logs cert-manager
kubectl logs -n cert-manager -l app=cert-manager

# Vérifier les events
kubectl get events --sort-by='.lastTimestamp' | grep -i cert

# Vérifier le challenge ACME
kubectl get challenges
kubectl describe challenge <challenge-name>
```

### Problème de connexion au cluster

```bash
# Vérifier que le kubeconfig est valide
kubectl cluster-info --kubeconfig=github-kubeconfig.yaml

# Tester l'authentification
kubectl auth can-i get pods --kubeconfig=github-kubeconfig.yaml
```

## Workflow Features

✅ **Déclenchement automatique** sur push
✅ **Déclenchement manuel** via l'interface GitHub
✅ **Installation/Upgrade cert-manager** idempotent
✅ **Attente de l'émission du certificat** (jusqu'à 4 minutes)
✅ **Résumé du déploiement** affiché dans les logs
✅ **Gestion d'erreurs** avec status exit codes

## Prochaines étapes

1. Configurez le secret `KUBECONFIG` dans GitHub
2. Pushez votre code
3. Vérifiez l'exécution dans l'onglet **Actions**
4. Accédez à votre application via HTTPS
