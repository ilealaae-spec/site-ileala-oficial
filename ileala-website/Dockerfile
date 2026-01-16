# Dockerfile para Railway - Node.js 20.19+ (requerido pelo Vite 7.2.6)
# Root Directory configurado como: ileala-website/
FROM node:20.19.0-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração
COPY package.json pnpm-lock.yaml ./
COPY .pnpmrc .nvmrc ./

# Instalar dependências
RUN pnpm install --no-frozen-lockfile

# Copiar todo o código
COPY . .

# Build
RUN pnpm run build

# Verify build output exists
RUN ls -la dist/public/ || (echo "ERROR: Build output not found!" && exit 1)

# Production mode
ENV NODE_ENV=production

CMD ["pnpm", "run", "start"]
