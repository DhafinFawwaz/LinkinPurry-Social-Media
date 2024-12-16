FROM node:20

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
RUN npm ci
RUN npm rebuild bcrypt


COPY --chown=node:node . .
COPY ./.env.example ./.env

RUN npx prisma generate

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
