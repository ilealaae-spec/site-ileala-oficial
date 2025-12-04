# Dockerfile para Railway - Node.js 20.19+ (requerido pelo Vite 7.2.6)
# Railway está configurado com workingDir = "ileala-website", então o contexto já está dentro dessa pasta
FROM node:20.19.0-alpine

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

