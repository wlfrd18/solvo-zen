# --- Stage 1 : build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
RUN npm prune --omit=dev

# --- Stage 2 : image de production ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN addgroup --system solvo && adduser --system --ingroup solvo solvo \
    && chown -R solvo:solvo /app
USER solvo
EXPOSE 3000
CMD ["npm", "run", "start"]
