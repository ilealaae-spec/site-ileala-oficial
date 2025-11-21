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
RUN pnpm install --no-frozen-lockfile --shamefully-hoist

# Copy application code
COPY . .

# Build application
RUN pnpm run build

# Final stage for app image
FROM base

# Copy node_modules and built files
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json

# Start the server
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
