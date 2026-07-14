# 🎬 Manlist Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?logo=jenkins&logoColor=white)
![Render](https://img.shields.io/badge/Hosted%20on-Render-46E3B7)
![License](https://img.shields.io/badge/License-Educational-green)

---

# 📖 Présentation

**Manlist** est une plateforme web permettant aux utilisateurs de gérer leur watchlist d'animés, de répondre à des questionnaires afin d'obtenir des recommandations personnalisées et de suivre leur progression.

Ce dépôt contient le **frontend** développé avec **React**, **TypeScript** et **Vite**.

L'application communique avec une API REST développée avec Symfony.

---

# 🚀 Fonctionnalités

| Fonctionnalité | Statut |
|---------------|:------:|
| Connexion | ✅ |
| Inscription | ✅ |
| Déconnexion | ✅ |
| Gestion du profil | ✅ |
| Upload d'image de profil | ✅ |
| Watchlist | ✅ |
| Consultation des questionnaires | ✅ |
| Réponses aux questionnaires | ✅ |
| Recommandations personnalisées | ✅ |
| Responsive Design | ✅ |

---

# 🏗 Architecture

```
Utilisateur

↓

React + TypeScript

↓

Hooks / Context

↓

Services API

↓

Symfony REST API

↓

PostgreSQL
```

---

# 🛠 Technologies

- React
- TypeScript
- Vite
- React Router
- Fetch API
- CSS
- Docker
- Jenkins
- Docker Hub
- Render

---

# 📂 Structure du projet

```
Manlist-Front
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── Jenkinsfile
├── Manlist_Front.Dockerfile
├── package.json
├── vite.config.ts
└── nginx.conf
```

---

# ⚙ Installation

## Prérequis

- Node.js 20+
- npm
- Docker (optionnel)

## Cloner le dépôt

```bash
git clone https://github.com/vinsomouk/ManlistF.git

cd Manlist-Front
```

## Installer les dépendances

```bash
npm install
```

## Variables d'environnement

Créer un fichier `.env` :

```env
VITE_API_BASE_URL=http://localhost:8000
```

En production :

```env
VITE_API_BASE_URL=https://manlist-back.onrender.com
```

## Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur :

```
http://localhost:5173
```

---

# 🧪 Vérifications

Analyse du code :

```bash
npm run lint
```

Compilation de production :

```bash
npm run build
```

Prévisualisation :

```bash
npm run preview
```

---

# 🌐 Communication avec l'API

Toutes les requêtes HTTP utilisent la variable :

```
VITE_API_BASE_URL
```

Exemples :

```
POST /api/auth/login

POST /api/auth/register

GET /api/auth/check

GET /api/watchlist

POST /api/questionnaires/{id}/submit
```

Cette configuration permet d'utiliser la même application aussi bien en développement qu'en production.

---

# 🐳 Docker

Construire l'image :

```bash
docker build \
-f Manlist_Front.Dockerfile \
-t manlist-front .
```

Lancer :

```bash
docker run \
-p 8080:80 \
manlist-front
```

---

# 🔒 Sécurité

Le frontend applique plusieurs bonnes pratiques :

- Communication HTTPS en production
- Variables d'environnement
- Gestion des erreurs API
- Validation des formulaires
- Authentification par session
- Cookies sécurisés (gérés par le backend)
- CORS sécurisé

---

# 🔍 Analyse des dépendances

Audit npm :

```bash
npm audit
```

Les vulnérabilités sont contrôlées avant les déploiements.

---

# 🔄 CI/CD

Le pipeline Jenkins automatise :

```
Checkout

↓

Installation npm

↓

Lint

↓

Build Vite

↓

Build Docker

↓

Scan Trivy

↓

Push Docker Hub
```

---

# 🐳 Docker Hub

Image publiée :

```
vmk700/manlist-front
```

Tags :

```
latest

BUILD_NUMBER
```

---

# ☁ Déploiement

Le frontend est hébergé sur **Render**.

Lors de chaque déploiement :

- installation des dépendances
- build Vite
- génération des fichiers statiques
- publication automatique

---

# 🌍 Variables d'environnement

| Variable | Description |
|----------|-------------|
| VITE_API_BASE_URL | URL de l'API Symfony |

---

# 📌 Commandes utiles

Installation :

```bash
npm install
```

Développement :

```bash
npm run dev
```

Lint :

```bash
npm run lint
```

Build :

```bash
npm run build
```

Prévisualisation :

```bash
npm run preview
```

Audit :

```bash
npm audit
```

---

# 🚀 Déploiement continu

Le projet est compatible avec un pipeline CI/CD basé sur :

```
Développeur

↓

GitHub

↓

Webhook (compatible)

↓

Jenkins

↓

Lint

↓

Build

↓

Docker

↓

Trivy

↓

Docker Hub

↓

Render
```

---

# 📈 Évolutions possibles

- Tests unitaires React (Vitest)
- Tests end-to-end (Playwright)
- OAuth (Google, Discord)
- Mode sombre
- Notifications
- Internationalisation
- Progressive Web App (PWA)

---

# 👨‍💻 Auteur

Projet réalisé dans le cadre du **Titre Professionnel Concepteur Développeur d'Applications (CDA)**.

Développé par **Khalidou Diakité**.