FROM node:11-alpine

RUN dpkg-reconfigure tzdata && sudo /etc/init.d/cron stop &&
    /etc/init.d/cron start && timedatectl

RUN apt-get install htop libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++ &&
npm install node-gyp && npm install pm2@latest -g

# Создать директорию app
RUN mkdir -p /app/config
RUN mkdir -p /app/exportTemplates
RUN mkdir -p /app/logs
RUN mkdir -p /app/src
RUN mkdir -p /app/upload
RUN mkdir -p /app/vendor

# раздаем права на расшареные папки
RUN chmod 777 app/logs
RUN chmod 777 app/upload

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package*.json ./

#  Используется при сборке кода в продакшене --only=production
RUN npm install && npm audit fix

# Скопировать исходники приложения
COPY config /app/config
COPY exportTemplates /app/exportTemplates
COPY vendor /app/vendor
COPY src /app

EXPOSE 3000

CMD [ "pm2", "start" , "npm" , "--start" ]