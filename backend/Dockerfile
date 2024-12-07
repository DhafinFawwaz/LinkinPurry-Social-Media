FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
# COPY --chown=node:node prisma ./prisma
COPY ./.env.example ./.env

RUN npm ci
# RUN npx prisma generate
# RUN npx prisma migrate deploy

COPY --chown=node:node . .


ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]