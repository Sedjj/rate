FROM node:12-alpine

ENV TZ=Asia/Yekaterinburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Создать директорий и раздаем права на расшареные папки
RUN mkdir -pv logs upload node_modules && \
chmod 777 logs && chmod 777 upload && chmod -w- node_modules

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package.json ./
COPY package-lock.json ./

#  Используется при сборке кода в продакшене --only=production
RUN npm install --only=production && npm audit fix

# Скопировать исходники приложения
COPY config /config
COPY exportTemplates /exportTemplates
COPY vendor /vendor
COPY src /src

RUN chmod 777 /src

CMD [ "npm" , "start" ]