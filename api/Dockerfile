FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY api/package*.json ./api/
RUN npm ci --workspace=packages/shared --workspace=api
COPY packages/shared ./packages/shared
COPY api ./api
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY api/package*.json ./api/
RUN npm ci --omit=dev --workspace=packages/shared --workspace=api && npm cache clean --force
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/api/dist ./api/dist
USER node
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --retries=3   CMD node -e "fetch('http://localhost:5000/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
CMD ["node", "api/dist/index.js"]
