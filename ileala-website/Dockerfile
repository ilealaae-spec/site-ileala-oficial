# Dockerfile para Railway - Node.js 20.19+ (requerido pelo Vite 7.2.6)
# Contexto: raiz do repositório (site-ileala-oficial/)
# Dockerfile está em: ileala-website/Dockerfile
FROM node:20.19.0-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.4.1

# Copiar arquivos de configuração do subdiretório ileala-website/
COPY ileala-website/package.json ileala-website/pnpm-lock.yaml ./
COPY ileala-website/.pnpmrc ileala-website/.nvmrc ./

# Instalar dependências
RUN pnpm install --no-frozen-lockfile

# Copiar todo o código do subdiretório ileala-website/
COPY ileala-website/ .

# Build
RUN pnpm run build

# Verify build output exists
RUN ls -la dist/public/ || (echo "ERROR: Build output not found!" && exit 1)

# Production mode
ENV NODE_ENV=production

CMD ["pnpm", "run", "start"]

