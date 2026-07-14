# Étape de construction de l'application React
FROM node:22-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation
COPY package.json package-lock.json ./

# Installation reproductible basée sur package-lock.json
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application Vite
RUN npm run build


# Image Nginx exécutée sans privilèges root
FROM nginxinc/nginx-unprivileged:1.27-alpine

# curl est utilisé par le HEALTHCHECK
USER root

RUN apk add --no-cache curl

# S'assurer que les répertoires utilisés sont accessibles à l'utilisateur Nginx
RUN mkdir -p /usr/share/nginx/html /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d

# Configuration Nginx
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers compilés du frontend
COPY --from=builder --chown=nginx:nginx \
    /app/dist \
    /usr/share/nginx/html

# Repasser sur l'utilisateur non privilégié fourni par l'image
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl --fail http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]