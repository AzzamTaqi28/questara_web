FROM node:22-alpine AS base

RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @questara/api build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN corepack enable && pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
