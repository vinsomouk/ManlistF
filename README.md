Manlist - Watchlist Interactive d'Animés

Manlist est une application web qui permet aux utilisateurs de gérer leur watchlist d'animés, de recevoir des recommandations personnalisées et de découvrir de nouveaux contenus.

Fonctionnalités Clés
✅ Gestion de watchlist personnalisée
✅ Système de recommandations basé sur des questionnaires
✅ Recherche et filtrage avancé d'animés
✅ Profil utilisateur avec synchronisation
✅ Interface responsive et moderne
✅ Suite complète de tests automatisés
Prérequis
Node.js 18+
Docker 20.10+
Jenkins 2.4+ (optionnel pour CI/CD)
npm 9+
Installation Locale
Cloner le dépôt



git clone https://github.com/votre-utilisateur/manlist-front.git
cd manlist-front
Installer les dépendances



npm install
Configurer les variables d'environnement
Créer un fichier .env à la racine :

env


VITE_API_BASE_URL=http://localhost:8000
VITE_ANILIST_API_URL=https://graphql.anilist.co
Démarrer l'application



npm run dev
L'application sera disponible sur : http://localhost:5173

Suite de Tests
Structure des tests


src/
├── test/
│   └── setup.ts
├── components/
│   └── Questionnaire/
│       └── __tests__/
│           └── QuestionnaireList.test.tsx
└── [autres composants avec leurs tests]
Commandes de test



# Exécuter tous les tests
npm run test

# Exécuter les tests avec UI
npm run test:ui

# Générer un rapport de couverture
npm run test:coverage

# Mode watch pour le développement
npm run test:watch

# Exécuter des tests spécifiques
npm run test:ui src/components/ApiComponents/AnimeList.test.tsx
Objectifs de couverture
Composants: 100% coverage
Hooks: 100% coverage
Services: 100% coverage
Utilitaires: 100% coverage
Pages: 90%+ coverage
Stratégie de test
Tests unitaires - Fonctionnalité individuelle des composants
Tests d'intégration - Interactions entre composants
Tests de sécurité - Validation des entrées, protection CSRF
Tests de performance - Charge et temps de réponse
Docker
Construire l'image Docker de l'application



docker build -t manlist-front -f docker/App_Dockerfile .
Construire l'image Docker de l'agent Jenkins



docker build -t agent_manlist_front -f docker/Agent_Dockerfile .
Lancer le conteneur d'application



docker run -d -p 8080:80 --name manlist-front manlist-front
Accéder à : http://localhost:8080

Configuration Jenkins
Prérequis
Serveur Jenkins avec Docker installé
Agent avec le tag "Agent_Manlist_Front"
Étapes d'installation
Configurer dans Jenkins :

Aller dans "Manage Jenkins" > "Nodes and Clouds"
Créer un nouveau node permanent
Nom: "Agent_Manlist_Front"
Labels: "Agent_Manlist_Front"
Lanceur: "Launch agent via execution of command on the controller"
Commande :



docker run -i --rm -v /var/run/docker.sock:/var/run/docker.sock agent_manlist_front
Configurer les credentials
Docker Registry: Ajouter un secret "docker-creds"
Serveur de staging: Ajouter une clé SSH "staging-server-creds"
Créer un nouveau pipeline
Sélectionner "Pipeline script from SCM"
SCM: Git
Repository URL: https://github.com/votre-utilisateur/manlist-front.git
Script Path: Jenkinsfile
Déclencher le pipeline
Manuellement via l'interface Jenkins
Automatiquement à chaque push sur la branche main
Jenkinsfile (Pipeline CI/CD)
groovy


pipeline {
    agent {
        label 'Agent_Manlist_Front'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm run test:coverage'
            }
        }

        stage('Build Production') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("manlist-front:${env.BUILD_ID}")
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker-compose up -d --build'
            }
        }
    }
}
Structure des Fichiers


manlist-front/
├── src/                 # Code source principal
├── test/                # Configuration des tests
├── docker/              # Fichiers Docker
│   ├── Agent_Dockerfile
│   └── App_Dockerfile
├── Jenkinsfile          # Configuration du pipeline CI/CD
├── nginx.conf           # Configuration Nginx
├── vite.config.ts       # Configuration Vite
├── package.json         # Dépendances et scripts
└── vitest.config.ts     # Configuration Vitest
Technologies Utilisées
Frontend: React 18, TypeScript, Vite
Testing: Vitest, React Testing Library
CI/CD: Jenkins, Docker
État global: Con API
Routing: React Router
Styling: CSS Modules
Contribuer
Créer une nouvelle branche



git checkout -b feature/nouvelle-fonctionnalite
Écrire les tests associés
typescript
11 lines
Click to expand
// Exemple de test pour un nouveau composant
import { describe, it, expect } from 'vitest';
...
Commiter les changements



git commit -am "Ajout nouvelle fonctionnalité avec tests"
Pousser la branche



git push origin feature/nouvelle-fonctionnalite
Ouvrir une Pull Request sur GitHub
Cette version regroupe toutes les informations dans un seul script tout en améliorant la lisibilité et la structure.
