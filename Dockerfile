FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Installer les dépendances système nécessaires pour canvas et autres packages natifs
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

COPY package.json package-lock.json* ./

# Nettoyer le cache npm et installer les dépendances
# Utiliser --legacy-peer-deps pour gérer les conflits de dépendances
RUN npm cache clean --force && \
    (npm ci --legacy-peer-deps || npm install --legacy-peer-deps)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Régénérer Prisma Client avec les bons binaryTargets pour Alpine
RUN npm run db:generate

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier Prisma et toutes ses dépendances pour les migrations en production
# Copier le client Prisma généré
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
# Copier tous les packages @prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Copier le CLI Prisma (prisma package)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
# Copier les dépendances principales de Prisma CLI
# effect est une dépendance critique de Prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/effect ./node_modules/effect
# Copier d'autres dépendances communes de Prisma (si elles existent)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
# Copier le schéma Prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copier package.json pour que npx fonctionne correctement
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Copier package-lock.json pour résoudre les dépendances
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json

# Créer le dossier storage pour les uploads
RUN mkdir -p storage/uploads/conventions storage/uploads/validations
RUN chown -R nextjs:nodejs storage

# Ajouter node_modules/.bin au PATH pour que npx fonctionne
ENV PATH="/app/node_modules/.bin:$PATH"

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

