FROM node:14
FROM mcr.microsoft.com/playwright:v1.34.0-jammy
WORKDIR /app
COPY package*.json ./
COPY *.js ./
COPY script.sh ./
RUN npm install
CMD ["node", "MetaEti.js"]
