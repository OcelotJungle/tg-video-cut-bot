FROM node:20 as build

WORKDIR /home/app

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY tsconfig.json .
COPY tsup.config.ts .

RUN npx tsup


FROM node:20-alpine as production

WORKDIR /home/app

COPY --from=build /home/app/package*.json ./

RUN npm ci --omit=dev

COPY --from=build /home/app/out/app.mjs ./

COPY prisma ./prisma
RUN npm run production:generate-client

CMD [ "npm", "run", "production:start" ]