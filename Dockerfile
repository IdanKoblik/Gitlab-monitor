ARG NODE_VERSION=18.0.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /home/container

COPY package*.json ./
RUN npm install
RUN npm ci --omit=dev

USER node

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]