# Multi-stage build for Next.js production

# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Stage 2: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 3: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
