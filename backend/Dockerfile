FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node backend/package*.json ./

RUN npm ci

COPY --chown=node:node backend/prisma ./prisma

RUN npx prisma generate
RUN npx prisma migrate deploy

COPY --chown=node:node . .

COPY ./.env.example ./.env

ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]