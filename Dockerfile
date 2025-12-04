# Dockerfile for Railway - Force clean build without cache
FROM node:20-alpine

# Disable all Docker layer caching
ARG CACHEBUST=2025-12-04-12-20
RUN echo "Force rebuild at: $CACHEBUST"

WORKDIR /app/ileala-website

# Install pnpm with specific version
RUN npm install -g pnpm@10.4.1 --force

# Copy package files
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./

# Clean any existing pnpm cache and store
RUN rm -rf /root/.local/share/pnpm/store || true
RUN rm -rf /root/.pnpm-store || true
RUN pnpm store prune || true

# Install dependencies without cache, frozen lockfile, and prefer offline disabled
RUN pnpm install --frozen-lockfile --no-cache --prefer-offline=false --force

# Copy source code
COPY ileala-website/ ./

# Clean Vite cache before build
RUN rm -rf node_modules/.vite || true
RUN rm -rf dist || true

# Build application
ENV NODE_ENV=production
RUN pnpm run build

# Start server
CMD ["pnpm", "run", "start"]
