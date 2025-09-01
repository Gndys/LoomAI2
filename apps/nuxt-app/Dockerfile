# Nuxt.js Production Dockerfile
FROM node:22-alpine AS base

# Build stage - install deps and build
FROM base AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Copy all files needed for build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json config.ts tsconfig.json ./
COPY apps/nuxt-app ./apps/nuxt-app
COPY libs ./libs

# Accept build arguments for CI/CD environments
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_WECHAT_APP_ID

# Copy .env file if it exists (for local builds)
COPY .env* ./

# Set build-time environment variables
# Priority: build args > .env file > fallback defaults
ENV BUILD_TIME=true
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
ENV NEXT_PUBLIC_WECHAT_APP_ID=${NEXT_PUBLIC_WECHAT_APP_ID}

# Install dependencies
RUN pnpm install --frozen-lockfile
# Build the application with increased memory limit
RUN pnpm build:nuxt

# Production image, copy all the files and run nuxt
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy built application
COPY --from=builder /app/apps/nuxt-app/.output ./apps/nuxt-app/.output

# Set correct permissions
RUN chown -R nuxtjs:nodejs /app
USER nuxtjs

EXPOSE 7001

ENV PORT=7001
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=7001

# Start the application
CMD ["node", "apps/nuxt-app/.output/server/index.mjs"] 