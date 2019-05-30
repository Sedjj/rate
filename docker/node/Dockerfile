FROM node:12-alpine

ENV TZ=Asia/Yekaterinburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Создать директорий и раздаем права на расшареные папки
RUN mkdir -pv app/logs app/upload app/node_modules && \
chmod 777 app/logs && chmod 777 app/upload && chmod 777 app/node_modules

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package.json app/
#COPY package-lock.json ./

#  Используется при сборке кода в продакшене --only=production
RUN cd app && npm install
RUN cd app && npm audit fix

# Скопировать исходники приложения
COPY config app/config
COPY exportTemplates app/exportTemplates
COPY vendor app/vendor
COPY src app/src

#RUN ls app/node_modules

RUN chmod 777 app

CMD cd app && npm run start
#CMD [ "npm", "run" , "start" ]