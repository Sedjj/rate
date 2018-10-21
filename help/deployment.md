# Развёртывание приложения на Ubuntu 16.04

## Установка окружения и приложения

Создать пользователя `tn-app`:
```bash
sudo adduser tn-app
sudo gpasswd -a tn-app sudo
```

Войти в систему под пользователем `tn-app`.

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

[Установить Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions):
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

[Установить MongoDB](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/):
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y --allow-unauthenticated mongodb-org
```

[Добавить MongoDB в автозагрузку](https://www.8host.com/blog/ustanovka-mongodb-v-ubuntu-16-04/):

Создать файл:
```bash
sudo nano /etc/systemd/system/mongodb.service
```

С содержимым:
```
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
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Установить Build Essential (для Osmosis):
```bash
sudo apt-get install build-essential
```

Создать директорию для статический файлов:
```bash
sudo mkdir /var/www/rate_bot
sudo chown tn-app:tn-app /var/www/rate_bot
```
####TODO проверить на практике

[Создать ssh ключи для взаимодействия с git сервером](http://gleb.pyatin.com/post/62728269139/bitbucket-setup-ssh-keys-ubuntu)
```bash
cd ~/.ssh
ssh-keygen -f git_rsa
ssh -T omeldarl@rambler.ru -i ~/.ssh/git_rsa

nano ~/.ssh/config
Host bitbucket.org
    IdentityFile ~/.ssh/git_rsa
    User rate
```

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

## Создание SSL-сертификатов Let’s Encrypt

В случае развертывания тестового приложения необходимо [добавить](https://community.vscale.io/hc/ru/community/posts/208332509-%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-SSL-%D1%81%D0%B5%D1%80%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%D0%BE%D0%B2-%D0%B4%D0%BB%D1%8F-Nginx-%D1%81-Let-s-Encrypt-%D0%BF%D0%BE%D0%B4-Ubuntu-16-04) бесплатные сертификаты Let’s Encrypt.

Установить клиент letsencrypt:
```bash
sudo apt-get install letsencrypt -y
```

Сгенерировать параметры Диффи-Хеллмана:
```bash
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```

Создать ключи для клиентского приложения:
```bash
sudo letsencrypt certonly -a webroot --webroot-path=/var/www/rate_bot -d test.rate_bot.ru
sudo mv -v /etc/letsencrypt/live/test.rate_bot.ru /etc/letsencrypt/live/rate_bot
```

Добавить обновление сертификатов по расписанию:
```bash
crontab -e
```

Добавит в конец файла:
```bash
30 5 * * 1 sudo letsencrypt renew
```

## [Настройка брандмауэра UFW](https://www.8host.com/blog/nastrojka-brandmauera-ufw-na-servere-ubuntu-16-04/)

Включение UFW:
```bash
sudo ufw enable
```

Проверка настроек:
```bash
sudo ufw status verbose
```

Включение http, https:
```bash
sudo ufw allow 'Nginx Full'
```

Включение ftp:
```bash
sudo ufw allow ftp
```

Включение ssh:
```bash
sudo ufw allow ssh
```
