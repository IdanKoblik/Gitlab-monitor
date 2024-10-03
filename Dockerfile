ARG NODE_VERSION=18.0.0
FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache --update curl ca-certificates openssl git tar bash sqlite fontconfig \
    && adduser --disabled-password --home /home/container container

LABEL org.opencontainers.image.authors="idankob@gmail.com"

ENV NODE_ENV production

WORKDIR /home/container

COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev

USER container

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]