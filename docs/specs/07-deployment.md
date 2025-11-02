# 07 — Déploiement et environnements

## 🌍 Environnements
| Environnement | Description | URL |
|----------------|--------------|-----|
| Dev | Développement local | http://localhost:4200 |
| Préprod | Tests internes | TBD |
| Prod | Production | blog.kubevpro.i-consulting.shop |

## 🧱 Build & CI/CD
- Build Angular : `ng build --configuration production`
- Tests : `npm run test`
- CI : GitHub Actions (lint + test + build)
- CD : déploiement sur AWS via GitHub Actions to kubectl / AWS CLI

## ☸️ Kubernetes
- Déploiement via manifest YAML
- Service exposé en LoadBalancer
- Ingress ALB + cert ACM
- Namespace : `blog-frontend`

## 🔐 Sécurité
- HTTPS obligatoire
- CORS autorisé uniquement depuis domaines Front
- Sécrets stockés dans AWS Secrets Manager
