FROM node:15.4.0-alpine3.10

RUN apk --no-cache add ca-certificates

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE 80

CMD ["npm", "start"]

