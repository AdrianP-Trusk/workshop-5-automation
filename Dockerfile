FROM ianwalter/puppeteer:latest

WORKDIR /usr/app

COPY . .

RUN npm install