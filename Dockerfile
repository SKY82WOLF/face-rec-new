FROM node:24.3.0-slim AS deps
WORKDIR /app

COPY package*.json ./
COPY .npmrc ./.npmrc
COPY src/assets/iconify-icons/ ./src/assets/iconify-icons/

# Install dependencies without running lifecycle scripts
RUN npm ci --ignore-scripts

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

# Runtime: Nginx serving the static export
FROM nginx:1.27-alpine AS runner

# Ensure optional include directory exists to avoid startup errors
RUN mkdir -p /etc/nginx/locations

# Provide server config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy static site
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

