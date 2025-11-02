# 🔐 Guide de Configuration SSL avec cert-manager et Let's Encrypt

Ce guide vous explique comment configurer SSL/TLS pour votre application Angular déployée sur Kubernetes avec le domaine `blog.kubevpro.i-consulting.shop`.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation de cert-manager](#installation-de-cert-manager)
- [Configuration du DNS](#configuration-du-dns)
- [Déploiement des ressources](#déploiement-des-ressources)
- [Vérification](#vérification)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Un cluster Kubernetes fonctionnel** (EKS, GKE, ou autre)
2. **kubectl configuré** pour accéder à votre cluster
3. **NGINX Ingress Controller installé** dans le cluster
4. **Un domaine** : `i-consulting.shop` avec accès aux DNS
5. **Helm 3** installé (recommandé pour cert-manager)

---

## 🚀 Installation de cert-manager

### Méthode 1 : Via Helm (recommandée)

```bash
# Ajouter le repository Helm de cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Installer cert-manager avec les CRDs
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.0 \
  --set installCRDs=true
```

### Méthode 2 : Via kubectl (manifests statiques)

```bash
# Installer cert-manager directement
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
```

### Vérifier l'installation

```bash
# Vérifier que les pods cert-manager sont en cours d'exécution
kubectl get pods --namespace cert-manager

# Sortie attendue :
# NAME                                      READY   STATUS    RESTARTS   AGE
# cert-manager-7d9f8c8c8-xxxxx              1/1     Running   0          2m
# cert-manager-cainjector-7d9f8c8c8-xxxxx   1/1     Running   0          2m
# cert-manager-webhook-7d9f8c8c8-xxxxx      1/1     Running   0          2m

# Vérifier les CRDs (Custom Resource Definitions)
kubectl get crds | grep cert-manager

# Sortie attendue :
# certificaterequests.cert-manager.io
# certificates.cert-manager.io
# challenges.acme.cert-manager.io
# clusterissuers.cert-manager.io
# issuers.cert-manager.io
# orders.acme.cert-manager.io
```

---

## 🌐 Configuration du DNS

### Étape 1 : Obtenir l'adresse IP externe de l'Ingress Controller

```bash
kubectl get svc -n ingress-nginx

# Recherchez le LoadBalancer avec EXTERNAL-IP
# NAME                                 TYPE           EXTERNAL-IP
# ingress-nginx-controller             LoadBalancer   a1b2c3d4...elb.amazonaws.com
```

### Étape 2 : Configurer le DNS

Dans votre console de gestion DNS (Route 53, Cloudflare, etc.) :

**Pour AWS Route 53 :**

```bash
# Créer un enregistrement CNAME
Type: CNAME
Name: blog.kubevpro
Value: <EXTERNAL-IP-du-LoadBalancer>
TTL: 300
```

**Pour Cloudflare ou autre :**

```
Type: CNAME
Name: blog.kubevpro
Target: <EXTERNAL-IP-du-LoadBalancer>
TTL: Auto
Proxy status: DNS only (orange cloud OFF for Let's Encrypt validation)
```

### Étape 3 : Vérifier la propagation DNS

```bash
# Vérifier que le domaine pointe bien vers votre cluster
nslookup blog.kubevpro.i-consulting.shop

# ou
dig blog.kubevpro.i-consulting.shop

# Le résultat doit montrer l'IP de votre LoadBalancer
```

⏰ **Attendez 5-10 minutes** pour la propagation DNS avant de continuer.

---

## 📦 Déploiement des ressources

### Étape 1 : Mettre à jour l'email dans le ClusterIssuer

Éditez le fichier `k8s/01-cluster-issuer-letsencrypt.yaml` et remplacez :

```yaml
email: contact@i-consulting.shop
```

Par votre **véritable adresse email**.

### Étape 2 : Déployer le ClusterIssuer Let's Encrypt

```bash
# Déployer le ClusterIssuer (production + staging)
kubectl apply -f k8s/01-cluster-issuer-letsencrypt.yaml

# Vérifier que les issuers sont créés
kubectl get clusterissuer

# Sortie attendue :
# NAME                  READY   AGE
# letsencrypt-prod      True    30s
# letsencrypt-staging   True    30s
```

### Étape 3 : Déployer l'Ingress avec TLS

```bash
# Appliquer la configuration Ingress avec TLS
kubectl apply -f k8s/ingress.yaml

# Vérifier l'Ingress
kubectl get ingress

# Sortie attendue :
# NAME                     CLASS   HOSTS                              ADDRESS         PORTS     AGE
# blog-frontend-ingress    nginx   blog.kubevpro.i-consulting.shop    <EXTERNAL-IP>   80, 443   1m
```

### Étape 4 : Attendre la génération du certificat

cert-manager va automatiquement :
1. Créer un `Certificate` resource
2. Demander un certificat à Let's Encrypt
3. Valider le domaine via HTTP-01 challenge
4. Stocker le certificat dans un Secret Kubernetes

```bash
# Suivre la génération du certificat
kubectl get certificate

# Sortie attendue (après quelques minutes) :
# NAME                    READY   SECRET                  AGE
# blog-frontend-tls-cert  True    blog-frontend-tls-cert  2m

# Voir les détails du certificat
kubectl describe certificate blog-frontend-tls-cert

# Voir les challenges ACME (si problème)
kubectl get challenges
```

⏰ **La génération du certificat prend 1-3 minutes** en général.

---

## ✅ Vérification

### 1. Vérifier le certificat

```bash
# Vérifier que le Secret TLS a été créé
kubectl get secret blog-frontend-tls-cert

# Voir les détails du secret
kubectl describe secret blog-frontend-tls-cert
```

### 2. Tester l'accès HTTPS

```bash
# Test avec curl
curl -I https://blog.kubevpro.i-consulting.shop

# Sortie attendue :
# HTTP/2 200
# server: nginx
# ...

# Vérifier le certificat SSL
openssl s_client -connect blog.kubevpro.i-consulting.shop:443 -servername blog.kubevpro.i-consulting.shop
```

### 3. Tester dans un navigateur

Ouvrez votre navigateur et accédez à :

```
https://blog.kubevpro.i-consulting.shop
```

✅ **Vous devriez voir** :
- 🔒 Cadenas vert dans la barre d'adresse
- Certificat valide émis par "Let's Encrypt Authority"
- Pas d'avertissement de sécurité

### 4. Tester la redirection HTTP → HTTPS

```bash
# HTTP devrait automatiquement rediriger vers HTTPS
curl -I http://blog.kubevpro.i-consulting.shop

# Sortie attendue :
# HTTP/1.1 308 Permanent Redirect
# Location: https://blog.kubevpro.i-consulting.shop/
```

---

## 🐛 Troubleshooting

### Le certificat n'est pas généré (READY = False)

#### 1. Vérifier les logs de cert-manager

```bash
kubectl logs -n cert-manager deployment/cert-manager
```

#### 2. Vérifier les challenges ACME

```bash
# Lister les challenges
kubectl get challenges

# Voir les détails d'un challenge
kubectl describe challenge <challenge-name>
```

**Problèmes courants :**
- ❌ **DNS non propagé** → Attendez 10-15 minutes
- ❌ **Ingress Controller non accessible** → Vérifiez le LoadBalancer
- ❌ **Firewall bloque le port 80** → Let's Encrypt ne peut pas valider

#### 3. Vérifier les CertificateRequests

```bash
kubectl get certificaterequest

kubectl describe certificaterequest <request-name>
```

---

### Erreur "too many certificates already issued"

**Cause :** Vous avez dépassé le rate limit de Let's Encrypt (5 certificats/semaine pour le même domaine).

**Solution :**
1. Utilisez d'abord `letsencrypt-staging` pour tester
2. Une fois que tout fonctionne, passez à `letsencrypt-prod`

```yaml
# Dans k8s/ingress.yaml, changez :
cert-manager.io/cluster-issuer: letsencrypt-staging
```

---

### L'Ingress ne redirige pas HTTP → HTTPS

**Vérifiez les annotations Ingress :**

```bash
kubectl get ingress blog-frontend-ingress -o yaml
```

Assurez-vous que ces annotations sont présentes :
```yaml
nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
nginx.ingress.kubernetes.io/ssl-redirect: "true"
```

---

### Certificat invalide ou auto-signé

**Cause possible :** Utilisation du staging issuer

**Solution :**
```bash
# Supprimer le certificat staging
kubectl delete certificate blog-frontend-tls-cert
kubectl delete secret blog-frontend-tls-cert

# Mettre à jour l'Ingress pour utiliser prod
kubectl apply -f k8s/ingress.yaml
```

---

## 🔄 Renouvellement automatique

cert-manager **renouvelle automatiquement** les certificats Let's Encrypt :

- ✅ Renouvellement déclenché **30 jours avant expiration**
- ✅ Les certificats Let's Encrypt sont valides **90 jours**
- ✅ Aucune action manuelle requise

Vérifier la date d'expiration :

```bash
kubectl get certificate blog-frontend-tls-cert -o jsonpath='{.status.notAfter}'
```

---

## 📊 Monitoring des certificats

### Vérifier l'état de tous les certificats

```bash
# Lister tous les certificats
kubectl get certificates --all-namespaces

# Voir les certificats qui expirent bientôt
kubectl get certificates -o json | \
  jq -r '.items[] | select(.status.notAfter != null) |
  "\(.metadata.name): \(.status.notAfter)"'
```

---

## 📝 Checklist de déploiement SSL

- [ ] cert-manager installé et pods en Running
- [ ] DNS configuré (CNAME → LoadBalancer)
- [ ] DNS propagé (vérification avec nslookup)
- [ ] Email mis à jour dans le ClusterIssuer
- [ ] ClusterIssuer déployé (production + staging)
- [ ] Ingress déployé avec annotations TLS
- [ ] Certificat généré (READY = True)
- [ ] Secret TLS créé
- [ ] HTTPS accessible depuis le navigateur
- [ ] Certificat valide (cadenas vert)
- [ ] Redirection HTTP → HTTPS fonctionne

---

## 🔗 Ressources supplémentaires

- **cert-manager docs** : https://cert-manager.io/docs/
- **Let's Encrypt rate limits** : https://letsencrypt.org/docs/rate-limits/
- **NGINX Ingress annotations** : https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
- **ACME HTTP-01 challenge** : https://letsencrypt.org/docs/challenge-types/

---

## 🎉 C'est terminé !

Votre application est maintenant accessible en **HTTPS sécurisé** avec un certificat gratuit Let's Encrypt qui se renouvelle automatiquement ! 🔒✨

**URL de production :** https://blog.kubevpro.i-consulting.shop
