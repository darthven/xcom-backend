FROM node:10.2.1

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
COPY . .

RUN npm install
RUN mkdir -p logs

VOLUME [ "/usr/src/app" ]