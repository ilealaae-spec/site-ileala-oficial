FROM node:20-alpine

WORKDIR /app

# Set default port
ENV PORT=3000

# Copy package files first (for better caching)
COPY package.json ./
COPY .npmrc* ./

# Install dependencies (no package-lock.json because .npmrc has package-lock=false)
RUN npm install --legacy-peer-deps --no-package-lock

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE ${PORT}

# Use npx to run serve from node_modules (already installed as dependency)
# This ensures PORT is properly expanded from environment variable
CMD ["sh", "-c", "npx serve -s dist -l ${PORT:-3000}"]

