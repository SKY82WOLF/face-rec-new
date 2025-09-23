FROM node:24.3.0-slim AS deps
WORKDIR /app

COPY package*.json ./
COPY .npmrc.docker ./.npmrc
COPY src/assets/iconify-icons/ ./src/assets/iconify-icons/

# Install dependencies without running lifecycle scripts
RUN npm config set registry https://registry.npmmirror.com \
  && npm ci --ignore-scripts

FROM node:24.3.0-slim AS builder
WORKDIR /app

# Reuse cached deps layer
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Iconify bundle (postinstall skipped above)
RUN npm run build:icons

# Build static export
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN npm run build

# Optional: an export-only stage for local artifact extraction
FROM scratch AS static
COPY --from=builder /app/out /out

# Final stage: static files only with no-op command so container can run
FROM alpine:3.20 AS runner
WORKDIR /app
COPY --from=builder /app/out /static
CMD ["sleep", "infinity"]

