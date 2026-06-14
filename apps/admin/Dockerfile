FROM node:22-alpine AS base

RUN npm install -g pnpm@9.15.4

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @questara/admin build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/package.json ./apps/admin/package.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages ./packages

RUN corepack enable && pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/admin
EXPOSE 3000
CMD ["pnpm", "start"]
