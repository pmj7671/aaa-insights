# Multi-stage build for the AAA Insights API.
# Build stage compiles TypeScript → dist/; runtime stage ships only prod deps + dist.

# --- build stage ---------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# --- runtime stage -------------------------------------------------------------
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# Cloud Run sends traffic to $PORT (default 8080); the server reads it.
EXPOSE 8080
CMD ["node", "dist/server.js"]
