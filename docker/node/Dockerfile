FROM node:12-alpine

ENV TZ=Asia/Yekaterinburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Создать директорий и раздаем права на расшареные папки
RUN mkdir -pv logs upload node_modules && \
chmod 777 logs && chmod 777 upload && chmod 777 node_modules

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package.json ./
#COPY package-lock.json ./

#  Используется при сборке кода в продакшене --only=production
RUN npm install
#RUN npm audit fix

# Скопировать исходники приложения
COPY config config
COPY exportTemplates exportTemplates
COPY vendor vendor
COPY src src

#RUN ls app/node_modules

RUN chmod 777 .

CMD ls -all && ls -all src && ls -all node_modules && npm run start debug
#CMD [ "npm", "run" , "start" ]