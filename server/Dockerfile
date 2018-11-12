FROM node:10.2.1

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm install
COPY . .

RUN npm run types:fix
RUN mkdir -p images/

VOLUME [ "/usr/src/app" ]
