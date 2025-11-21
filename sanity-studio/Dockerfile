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
# Railway injects PORT as environment variable
# Use ENV to set default, then use it in CMD
ENV PORT=3000
# Use exec form to ensure PORT is properly expanded
CMD ["sh", "-c", "exec serve -s dist -l \"${PORT:-3000}\""]

