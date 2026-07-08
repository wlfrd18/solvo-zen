# Image de developpement : sert `next dev` avec le code monte en volume
# depuis docker-compose. Pour une image de production, ajouter une
# etape `next build` + `next start` separee.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
