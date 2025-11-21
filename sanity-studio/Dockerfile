FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package.json ./
COPY .npmrc* ./

# Install dependencies (no package-lock.json because .npmrc has package-lock=false)
RUN npm install --legacy-peer-deps --no-package-lock

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Start the application using serve
RUN npm install -g serve
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]

