FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY web/package*.json ./web/
RUN npm ci --workspace=packages/shared --workspace=web
COPY packages/shared ./packages/shared
COPY web ./web
RUN npm run build --workspace=web

FROM nginx:1.26-alpine AS runner
COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
