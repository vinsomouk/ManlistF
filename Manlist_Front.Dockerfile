FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && \
    corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s \
            --timeout=5s \
            --retries=3 \
CMD curl --fail http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]