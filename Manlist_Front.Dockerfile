# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Production stage
FROM nginx:1.23-alpine

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurer Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sécurité : Supprimer les headers sensibles
RUN echo "server_tokens off;" >> /etc/nginx/nginx.conf && \
    sed -i 's/^http {/http {\n    proxy_hide_header X-Powered-By;/' /etc/nginx/nginx.conf

# Ports et santé
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1