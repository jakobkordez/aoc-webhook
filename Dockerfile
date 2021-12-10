FROM node:16-slim

WORKDIR /usr/src/app

COPY package*.json .
COPY index.js .
COPY .env .

RUN npm install

CMD [ "node", "index.js" ]