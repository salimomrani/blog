# Configuration des Secrets GitHub pour kOps

## 📋 Secrets à configurer

Pour que le workflow CI/CD fonctionne avec kOps, vous devez configurer les secrets suivants dans GitHub :

### 1. AWS Credentials

```bash
AWS_ACCESS_KEY_ID       # Votre AWS Access Key ID
AWS_SECRET_ACCESS_KEY   # Votre AWS Secret Access Key
AWS_REGION              # Région AWS (ex: us-east-1, eu-west-1)
```

### 2. kOps Configuration

```bash
KOPS_STATE_STORE        # s3://kopsstate9569 (votre bucket S3)
KOPS_CLUSTER_NAME       # Nom de votre cluster kOps (ex: kubevpro.i-consulting.shop)
```

### 3. Docker Hub (existants)

```bash
DOCKER_USERNAME         # Votre username Docker Hub
DOCKER_PASSWORD         # Votre password Docker Hub
```

## 🔧 Comment obtenir les valeurs

### AWS Credentials

```bash
# Option 1: Depuis AWS Console
# IAM → Users → Your User → Security credentials → Create access key

# Option 2: Si vous avez déjà configuré AWS CLI localement
cat ~/.aws/credentials

# Vous verrez:
# [default]
# aws_access_key_id = AKIA...
# aws_secret_access_key = xyz...
```

### AWS Region

```bash
# La région où votre cluster kOps est déployé
# Exemples courants:
# - us-east-1 (Virginie du Nord)
# - eu-west-1 (Irlande)
# - eu-central-1 (Francfort)

# Vérifier depuis votre terminal:
echo $AWS_DEFAULT_REGION

# Ou depuis kOps:
kops get cluster --state=s3://kopsstate9569
```

### kOps State Store

```bash
# Le bucket S3 où kOps stocke la configuration
# Vous le connaissez déjà: s3://kopsstate9569

# Vérifier:
kops get clusters --state=s3://kopsstate9569
```

### kOps Cluster Name

```bash
# Le nom complet de votre cluster
# Probablement: kubevpro.i-consulting.shop

# Vérifier:
kops get clusters --state=s3://kopsstate9569

# Résultat attendu:
# NAME                            CLOUD   ZONES
# kubevpro.i-consulting.shop      aws     us-east-1a,us-east-1b,us-east-1c
```

## 📝 Ajouter les secrets dans GitHub

### Via l'interface web

1. Allez sur votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret avec son nom et sa valeur

### Via GitHub CLI (gh)

```bash
# Configurer tous les secrets en une commande
gh secret set AWS_ACCESS_KEY_ID -b "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY -b "xyz..."
gh secret set AWS_REGION -b "us-east-1"
gh secret set KOPS_STATE_STORE -b "s3://kopsstate9569"
gh secret set KOPS_CLUSTER_NAME -b "kubevpro.i-consulting.shop"
```

## ✅ Vérification

Après avoir configuré les secrets, testez le workflow :

```bash
# Créer un commit et pusher sur master
git add .
git commit -m "test: verify kOps kubeconfig generation"
git push origin master

# Surveiller l'exécution:
gh run watch
```

## 🔐 Permissions IAM requises

Votre utilisateur AWS doit avoir les permissions suivantes :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kopsstate9569",
        "arn:aws:s3:::kopsstate9569/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🗑️ Ancien secret à supprimer

Une fois que le nouveau workflow fonctionne, vous pouvez **supprimer** :

```bash
KUBE_CONFIG_DATA  # ❌ Plus nécessaire avec kOps
```

## 🎯 Avantages de cette approche

✅ **Plus de base64 à mettre à jour manuellement**
✅ Kubeconfig toujours à jour automatiquement
✅ Fonctionne même si l'IP du serveur change
✅ Configuration centralisée dans S3
✅ Meilleure sécurité (credentials AWS au lieu de kubeconfig complet)
