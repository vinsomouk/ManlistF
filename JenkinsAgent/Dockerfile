# Agent Jenkins pour le projet Manlist-Front
FROM jenkins/agent:latest-jdk11

# Installer les dépendances système
USER root
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    git \
    docker.io \
    build-essential

# Installer Node.js 18.x
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Installer les outils frontend
RUN npm install -g pnpm@8 vite@4 eslint@8

# Configurer Docker (pour les étapes de build dans Jenkins)
RUN usermod -aG docker jenkins && \
    chmod 777 /var/run/docker.sock

# Installer les outils de test
RUN npm install -g jest@29 react-testing-library@14 nyc@15

# Configurer l'environnement
USER jenkins
WORKDIR /home/jenkins
ENV CI=true