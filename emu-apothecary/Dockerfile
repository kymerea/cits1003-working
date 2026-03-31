FROM node:20-bullseye

COPY . /app/
WORKDIR /app
RUN npm install && mv /app/flag.txt /flag.txt

USER node
CMD ["npm", "run", "start"]