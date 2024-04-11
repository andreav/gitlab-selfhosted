# Stage 1: Build
FROM node:latest AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Prod
FROM node:alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

RUN npm install --only=prod

CMD ["sh"]
