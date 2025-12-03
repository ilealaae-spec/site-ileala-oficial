# Simple Dockerfile for Railway
FROM node:20-alpine

WORKDIR /app/ileala-website

# Copy package files
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY ileala-website/ ./

# Build application
RUN pnpm run build

# Start server
CMD ["pnpm", "run", "start"]
