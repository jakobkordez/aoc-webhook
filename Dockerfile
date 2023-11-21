FROM node:20-alpine

WORKDIR /app

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apk update && apk upgrade
RUN apk add --no-cache chromium font-roboto-mono font-noto-emoji

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

CMD [ "yarn", "start" ]
