FROM keymetrics/pm2:12-alpine

WORKDIR /opt/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4044

CMD ["sh", "-c", "npm run db:migrate; npm run db:seed; pm2-runtime start ecosystem.config.js --env production" ]