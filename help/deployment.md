# Развёртывание приложения на Ubuntu 18.04

IP сервера: 176.57.215.147 
Имя пользователя: root 
Пароль: oBVg9MVD 

#Настройка безопасности

###Отключение доступа по паролю
Для того, чтобы доступ к серверу мог осуществляться только по ключу, необходимо запретить авторизацию по паролю. Для этого требуется внести правки в файл /etc/ssh/sshd_config.

* Откройте файл командой:
```bash
sudo nano /etc/ssh/sshd_config
```
* Найдите в нем строку PasswordAuthentication и замените ее значение на: PasswordAuthentication no.
* Сохраните изменения, после чего перезапустите службу SSH:
```bash
sudo service ssh restart
```

### Установка окружения и приложения
Установить сетевые тулзы:
```bash
apt install net-tools
```

Установка часового пояса
```bash
sudo dpkg-reconfigure tzdata
sudo /etc/init.d/cron stop
sudo /etc/init.d/cron start
timedatectl
```

Создать пользователя `tn-app`:
```bash
sudo adduser mongo
sudo gpasswd -a mongo sudo
```

Смена пароля
```bash
sudo bash
passwd имя_пользователя
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
sudo ufw allow from 37.79.1.25/32 to any port 27017
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
```bash
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
npm install node-gyp
```

[Настроить pm2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04).

http://pm2.keymetrics.io/docs/usage/quick-start/

Установим pm2, чтоб бы можно было запустить бота как службу
```bash
sudo npm install pm2@latest -g
```


Запуск бота
```bash
pm2 start npm -- start
```

```
 pm2 list

pm2 show npm
```

Stop an application with this command (specify the PM2 App name or id):

pm2 stop app_name_or_id
Restart an application:

pm2 delete 0

pm2 restart app_name_or_id
List the applications currently managed by PM2:

pm2 list
Get information about a specific application using its App name:

pm2 info app_name
The PM2 process monitor can be pulled up with the monit subcommand. This displays the application status, CPU, and memory usage:

pm2 monit
Note that running pm2 without any arguments will also display a help page with example usage.

Now that your Node.js application is running and managed by PM2, let's set up the reverse proxy.






























