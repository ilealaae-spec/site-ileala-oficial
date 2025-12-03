# Dockerfile para Railway - Otimizado para build rápido
# Este arquivo deve estar na RAIZ do repositório (site-ileala-oficial/)
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração do ileala-website
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./ileala-website/
COPY ileala-website/.pnpmrc ./ileala-website/

# Instalar dependências
WORKDIR /app/ileala-website
RUN pnpm install --frozen-lockfile --prefer-offline

# Copiar código do ileala-website
COPY ileala-website/ .

# Build the application from source with optimizations
ENV NODE_ENV=production
RUN pnpm run build

# Start
WORKDIR /app/ileala-website
ENTRYPOINT ["pnpm", "run", "start"]
