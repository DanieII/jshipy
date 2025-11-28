FROM node:20

RUN useradd -ms /bin/sh -u 1001 app

USER app

WORKDIR /app

COPY package.json .

RUN npm install

COPY --chown=app:app . /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
