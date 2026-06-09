FROM node:22 AS frontend-builder

COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

FROM node:22

COPY ./Backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

CMD ["node", "server.js"]