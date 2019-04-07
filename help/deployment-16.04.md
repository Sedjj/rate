# Развёртывание приложения на Ubuntu 16.04

##Базовые настройка сервера

###Создать пользователя `rb-app`:
```bash
sudo adduser rb-app &&
sudo adduser rb-app sudo &&
sudo gpasswd -a rb-app sudo
```
Войти в систему под пользователем `rb-app`.

Смена пароля root
```bash
sudo bash
passwd root
```

###Обновить список пакетов:
```bash
sudo apt-get update 
sudo apt-get upgrade
```

###Установка часового пояса
```bash
sudo dpkg-reconfigure tzdata &&
sudo /etc/init.d/cron stop &&
sudo /etc/init.d/cron start &&
timedatectl
```

###Установка диспетчера задач
```bash
sudo apt-get install htop
```

##Настройка ПО

###Установить curl (если отсутствует):
```bash
sudo apt-get install curl
sudo apt-get install build-essential libssl-dev
```

###[Установить Node.js](https://github.com/nodesource/distributions):
```bash
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs
```

###[Установить MongoDB](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/):
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 &&
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" |
sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list &&
sudo apt-get update &&
sudo apt-get install -y mongodb-org
```
[Добавить MongoDB в автозагрузку](https://www.8host.com/blog/ustanovka-mongodb-v-ubuntu-16-04/):

Создать файл:
```bash
sudo nano /etc/systemd/system/mongodb.service
```

С содержимым:
```bash
[Unit]
Description=High-performance, schema-free document-oriented database
After=network.target
[Service]
User=mongodb
ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf
[Install]
WantedBy=multi-user.target
```

Запустить MongoDB сервис:
```bash
sudo systemctl unmask mongodb &&
sudo systemctl start mongodb.service &&
sudo systemctl enable mongodb
```

#####Команды работы с mongoDB
```bash
sudo systemctl status mongodb.service
sudo systemctl stop mongodb
sudo systemctl start mongodb
sudo systemctl restart mongodb
```

#####Удалиь и добвить в автозапуск mongodb
```bash
sudo systemctl disable mongodb
sudo systemctl enable mongodb
```

#####Удалиь  mongodb
```bash
sudo service mongod stop &&
sudo apt-get purge mongodb-org* &&
sudo rm -r /var/log/mongodb &&
sudo rm -r /var/lib/mongodb
```

#####Тест работы
```bash
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

###Создать директорию для статический файлов:
```bash
sudo mkdir rate_bot &&
sudo chown rb-app:rb-app rate_bot &&
sudo mkdir mongodb &&
sudo mkdir mongodb/db &&
sudo mkdir mongodb/log
sudo chown rb-app:rb-app mongodb
```

###Установить NPM 

```
sudo apt install npm 
```

### [Настройка брандмауэра UFW](https://www.8host.com/blog/nastrojka-brandmauera-ufw-na-servere-ubuntu-18-04/)

Включение UFW:
```bash
sudo ufw enable
sudo ufw disable
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
sudo ufw allow from  37.79.133.158 to any port 27017
```

Несмотря на то, что порт открыт, MongoDB в настоящее время только прослушивает локальный адрес 127.0.0.1. Чтобы разрешить удаленные подключения, добавьте публично маршрутизируемый IP-адрес вашего сервера в mongod.confфайл.

Откройте файл конфигурации MongoDB в редакторе:
```bash
sudo nano /etc/mongodb.conf
```

```bash
logappend=true

bind_ip = 127.0.0.1,your_server_ip
#port = 27017
```
Oбязательно поместите запятую между существующим IP-адресом и тем, который вы добавили.

Сохраните файл, выйдите из редактора и перезапустите MongoDB:
```bash
sudo systemctl restart mongodb
```

###Установим дополнительное ПО
```bash
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++ &&
npm install node-gyp
```

### [Настроить pm2](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04).

http://pm2.keymetrics.io/docs/usage/quick-start/

Установим pm2, чтоб бы можно было запустить бота как службу
```bash
sudo npm install pm2@latest -g
```

##Запуск бота
```bash
pm2 start npm --start
```

Для просмотра списока задач используется `pm2 list`
```bash
pm2 list
```
 
Для просмотра работы задачи используется `pm2 monit`. Это отображает состояние приложения, CPU и использование памяти
```bash
pm2 monit
```

Для просмотра детальной информации о задаче используется `pm2 show app_name_or_id`
```bash
pm2 show npm
```

Для остановки задачи используется `pm2 stop app_name_or_id`
```bash
pm2 stop npm
```

Для удаление задачи используется `pm2 delete app_name_or_id`
```bash
pm2 delete npm
```

Для перезапуск задачи используется `pm2 restart app_name_or_id`
```bash
pm2 restart npm
```