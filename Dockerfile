# Verwende ein Basis-Image für Node.js 20 mit ARM-Unterstützung
FROM node:20-bullseye-slim

# Setze das Arbeitsverzeichnis auf /app
WORKDIR /app

# Kopiere package.json und package-lock.json in den Container
COPY package*.json ./

# Installiere die Projektabhängigkeiten inklusive devDependencies
RUN npm install

# Kopiere den gesamten Projektinhalt ins Image
COPY . .

# Installiere Puppeteer und alle erforderlichen Abhängigkeiten für Chromium
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libnss3 \
  libx11-xcb1 \
  libgbm-dev \
  libxcomposite-dev \
  libxrandr-dev \
  libasound2 \
  --no-install-recommends

# Installiere Chromium explizit für ARM
RUN apt-get install -y chromium

# Setze den Chromium-Pfad in Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Starte die Node.js-Anwendung im Entwicklungsmodus
CMD ["npm", "run", "dev"]
