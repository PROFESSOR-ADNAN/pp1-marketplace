FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY worker/package*.json ./worker/
RUN npm ci --workspace=packages/shared --workspace=worker
COPY packages/shared ./packages/shared
COPY worker ./worker
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=worker

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY worker/package*.json ./worker/
RUN npm ci --omit=dev --workspace=packages/shared --workspace=worker && npm cache clean --force
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/worker/dist ./worker/dist
USER node
CMD ["node", "worker/dist/index.js"]
