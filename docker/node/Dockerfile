FROM node:11-alpine

ENV TZ=Asia/Yekaterinburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get install htop

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
COPY package*.json /app

#  Используется при сборке кода в продакшене --only=production
RUN npm install --only=development && npm audit fix

# Скопировать исходники приложения
COPY config /app/config
COPY exportTemplates /app/exportTemplates
COPY vendor /app/vendor
COPY src /app

EXPOSE 3000

CMD [ "npm" , "start" ]