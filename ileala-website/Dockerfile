# Dockerfile para Railway - Força Node.js 20.12.0
# Railway está configurado com workingDir = "ileala-website", então o contexto já está dentro dessa pasta
FROM node:20.12.0-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração (contexto já está em ileala-website/)
COPY package.json pnpm-lock.yaml .pnpmrc .nvmrc ./

# Instalar dependências
RUN pnpm install --no-frozen-lockfile

# Copiar código (contexto já está em ileala-website/)
COPY . .

# Build
RUN pnpm run build

# Start
CMD ["pnpm", "run", "start"]

