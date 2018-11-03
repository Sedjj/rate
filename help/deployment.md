# Развёртывание приложения на Ubuntu 18.04

IP сервера: 176.57.215.147
Имя пользователя: root
Пароль: u7PW5sUU

## Установка окружения и приложения

Создать пользователя `tn-app`:
```bash
sudo adduser mongo
sudo gpasswd -a mongo sudo
```

Войти в систему под пользователем `mongo`.

Обновить список пакетов:
```bash
sudo apt-get update
```

Установить curl (если отсутствует):
```bash
sudo apt-get install curl
```

Установить Git:
```bash
sudo apt-get install git
```

[Установить Node.js](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/):
```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm install node
```

[Установить MongoDB](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/):
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.1 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y --allow-unauthenticated mongodb-org
or
sudo apt-get install -y mongodb
```

Команды работы с mongoDB
```bash
sudo systemctl status mongodb
sudo systemctl stop mongodb
sudo systemctl start mongodb
sudo systemctl restart mongodb
```

Удалиь и добвить в автозапуск mongodb
```bash
sudo systemctl disable mongodb
sudo systemctl enable mongodb
```

Тест работы
```bash
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

Создать директорию для статический файлов:
```bash
sudo mkdir rate_bot
sudo chown mongo:mongo rate_bot

sudo mkdir /var/www/rate_bot
sudo chown mongo:mongo /var/www/rate_bot

sudo mkdir mongodb
sudo mkdir mongodb/db
sudo mkdir mongodb/log
```

Установить NPM 

```
sudo apt install npm 
```

####TODO проверить на практике

## Ручное развёртывание

Склонировать файлы проекта:
```bash
cd ~
git clone git@gitlab.com:developmentKit/projects/bot/rate.git
cd rate_bot
npm install --only=production
```

Статические файлы сайта копировать в `/var/www/rate_bot`.

[Развернуть БД](http://o7planning.org/en/10279/importing-and-exporting-mongodb-database).

## [Настройка брандмауэра UFW](https://www.8host.com/blog/nastrojka-brandmauera-ufw-na-servere-ubuntu-18-04/)

Включение UFW:
```bash
sudo ufw enable
```

Проверка настроек:
```bash
sudo ufw status verbose
```

Включение ftp:
```bash
sudo ufw allow ftp
```

Включение ssh:
```bash
sudo ufw allow ssh
```

Включение mongo:
```bash
sudo ufw allow from 176.57.215.147/32 to any port 27017  
```

Несмотря на то, что порт открыт, MongoDB в настоящее время только прослушивает локальный адрес 127.0.0.1. Чтобы разрешить удаленные подключения, добавьте публично маршрутизируемый IP-адрес вашего сервера в mongod.confфайл.

Откройте файл конфигурации MongoDB в редакторе:
```bash
sudo nano /etc/mongodb.conf
```

```bash
...
logappend=true

bind_ip = 127.0.0.1,your_server_ip
#port = 27017

...
```
Oбязательно поместите запятую между существующим IP-адресом и тем, который вы добавили.

Сохраните файл, выйдите из редактора и перезапустите MongoDB:
```bash
sudo systemctl restart mongodb
```

Установим дополнительное ПО
```
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
npm install node-gyp
```
