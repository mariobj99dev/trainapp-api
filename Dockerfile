FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile \
  && pnpm store prune

COPY --from=builder --chown=node:node /app/dist ./dist

RUN mkdir -p /app/logs && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
