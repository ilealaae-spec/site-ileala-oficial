# syntax = docker/dockerfile:1

# Base image
FROM node:20-slim AS base
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# Install pnpm
RUN npm install -g pnpm@9.15.2

# Install dependencies
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN pnpm run build

# Final stage for app image
FROM base
COPY --from=build /app /app

# Start the server
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
