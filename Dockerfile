# Dockerfile for Railway - Cache busting version
FROM node:20-alpine

# Force cache invalidation
ARG CACHEBUST=1
RUN echo "Cache bust: $CACHEBUST"

WORKDIR /app/ileala-website

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./

# Install dependencies (no cache)
RUN pnpm install --frozen-lockfile --no-cache

# Copy source code
COPY ileala-website/ ./

# Build application
ENV NODE_ENV=production
RUN pnpm run build

# Start server
CMD ["pnpm", "run", "start"]
