ARG NODE_VERSION=18.0.0
FROM node:${NODE_VERSION}-alpine

RUN apk add --no-cache --update curl ca-certificates openssl \
    && adduser --disabled-password --home /home/container container

LABEL org.opencontainers.image.authors="idankob@gmail.com"

ENV NODE_ENV production

WORKDIR /app/

COPY package*.json /app/
RUN npm ci --omit=dev
COPY . /app/

USER container

WORKDIR /home/container/

EXPOSE 3000

CMD ["node", "/app/index.js"]