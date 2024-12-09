FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node frontend/package*.json ./

COPY --chown=node:node frontend/ ./

RUN npm ci

RUN npm run build

CMD npm run preview