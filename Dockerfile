# Dockerfile para Railway - Força Node.js 20.12.0
# Este arquivo deve estar na RAIZ do repositório (site-ileala-oficial/)
FROM node:20.12.0-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração do ileala-website
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./ileala-website/
COPY ileala-website/.pnpmrc ./ileala-website/
COPY ileala-website/.nvmrc ./ileala-website/

# Instalar dependências
WORKDIR /app/ileala-website
RUN pnpm install --no-frozen-lockfile

# Copiar código do ileala-website
COPY ileala-website/ .

# Build
RUN pnpm run build

# Start (permanece em ileala-website)
# Usar shell form para garantir que o comando seja executado no diretório correto
WORKDIR /app/ileala-website
CMD pnpm run start

