FROM node:18-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    wget \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY server.js ./

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 3000
CMD [ "npm", "start" ]
