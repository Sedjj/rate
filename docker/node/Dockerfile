FROM node:12-alpine

ENV TZ=Asia/Yekaterinburg
ENV NPM_CONFIG_PREFIX=/home/app/.npm-global
ENV PATH=$PATH:/home/app/.npm-global/bin

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install pm2 -g

# Создать директорий и раздаем права на расшареные папки
RUN mkdir -pv /home/app/logs /home/app/upload

# Скопировать исходники приложения
COPY config /home/app/config
COPY exportTemplates /home/app/exportTemplates
COPY vendor /home/app/vendor
COPY src /home/app/src

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY package.json /home/app
COPY process.yml /home/app
COPY package-lock.json /home/app

WORKDIR /home/app

# Running npm install for production purpose will not run dev dependencies.
RUN npm install --only=production
RUN npm audit fix

# Create a user group 'xyzgroup'
RUN addgroup -S xyzgroup

# Create a user 'appuser' under 'xyzgroup'
RUN adduser -S -D -h /home/app appuser xyzgroup

# Chown all the files to the app user.
RUN chown -R appuser:xyzgroup /home/app

# Switch to 'appuser'
USER appuser

CMD ["pm2-runtime", "--json", "process.yml"]