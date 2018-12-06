# Развёртывание приложения на Ubuntu 16.04

##Настройка безопасности

###Создать пользователя `rb-app`:
```bash
sudo adduser rb-app
sudo adduser rb-app sudo
sudo gpasswd -a rb-app sudo
```
Войти в систему под пользователем `rb-app`.

Смена пароля
```bash
sudo bash
passwd имя_пользователя
```

###Отключение доступа по паролю
Для того, чтобы доступ к серверу мог осуществляться только по ключу, необходимо запретить авторизацию по паролю. Для этого требуется внести правки в файл /etc/ssh/sshd_config.

* Откройте файл командой:
```bash
sudo nano /etc/ssh/sshd_config
```
* Откройте файл /etc/ssh/sshd_config . В зависимости от Linux-дистрибутива, строка PasswordAuthentification может присутствовать в файле в закомментированном виде (# в начале строки) или отсутствовать – соответственно раскомментируйте или добавьте ее (PasswordAuthentification no).

* Для запрет ssh-подключения от имени root-пользователя. Найдите в нем строку PermitRootLogin  и замените ее значение на: PermitRootLogin  no.

* Сохраните изменения, после чего перезапустите службу SSH:
```bash
sudo service ssh restart
```

###Обновить список пакетов:
```bash
sudo apt-get update 
sudo apt-get upgrade
```

###Настройка Fail2Ban 

```bash
sudo apt-get install fail2ban
```

Конфиги находятся в каталоге /etc/fail2ban.
```
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```
ignoreip — значения этого параметра говорят о том, какие IP-адреса блокироваться не будут вовсе. Если вы хотите, чтобы Fail2ban игнорировал при проверке несколько IP-адресов, их необходимо указать в значении ignoreip через пробел.

bantime — данный параметр означает время в секундах, в течение которого подозрительный IP будет заблокирован. Изначально его значение составляет 10 минут.

findtime — определяет промежуток времени в секундах, в течение которого программой будет определяться наличие подозрительной активности.

maxretry — допустимое число неуспешных попыток получения доступа к серверу. При превышении указанного значения IP попадает в бан.

После изменения конфигурации следует перезапускать fail2ban командой:
```bash
sudo systemctl restart fail2ban.service
```

###Угроза извне. Конфигурируем брандмауэр ipkungfu
```bash
sudo apt-get install ipkungfu
```

Правим конфиг
```bash
sudo nano /etc/ipkungfu/ipkungfu.conf

# Локальная сеть, если есть — пишем адрес сети вместе с маской, нет — пишем loopback-адрес
LOCAL_NET="127.0.0.1"

# Наша машина не является шлюзом
GATEWAY=0

# Закрываем нужные порты
FORBIDDEN_PORTS="135 137 139"

# Блокируем пинги, 90% киддисов отвалится на этом этапе
BLOCK_PINGS=1

# Дропаем подозрительные пакеты (разного рода флуд)
SUSPECT="DROP"

# Дропаем «неправильные» пакеты (некоторые типы DoS)
KNOWN_BAD="DROP"

# Сканирование портов? В трэш!
PORT_SCAN="DROP"
```

Для включения ipkungfu открываем файл /etc/default/ipkungfu и меняем строку IPKFSTART = 0 на IPKFSTART = 1. 
```bash
sudo nano /etc/default/ipkungfu
```

Запускаем
```bash
sudo ipkungfu
```

###Дополнительно внесем правки в /etc/sysctl.conf
```bash
sudo nano /etc/sysctl.conf

# Дропаем ICMP-редиректы (против атак типа MITM)
net.ipv4.conf.all.accept_redirects=0
net.ipv6.conf.all.accept_redirects=0
# Включаем механизм TCP syncookies
net.ipv4.tcp_syncookies=1
# Различные твики (защита от спуфинга, увеличение очереди «полуоткрытых» TCP-соединений и так далее)
net.ipv4.tcp_timestamps=0
net.ipv4.conf.all.rp_filter=1
net.ipv4.tcp_max_syn_backlog=1280
kernel.core_uses_pid=1
```

Активируем изменения:
```bash
sudo sysctl -p
```

###Выявляем вторжения
Snort — один из любимейших инструментов админов и главный фигурант всех руководств по безопасности
```bash
sudo apt-get install snort
snort -D
```

###Поиск следов вторженца
Установка, настройка и использование сканера уязвимостей сервера rkhunter
```bash
sudo apt-get install rkhunter
sudo rkhunter -c --sk
```

Софтина проверит всю систему на наличие руткитов и выведет на экран результаты. Если зловред все-таки найдется, rkhunter укажет на место и его можно будет затереть. Более детальный лог располагается здесь: /var/log/rkhunter.log. Запускать rkhunter лучше в качестве cron-задания ежедневно:

```bash
sudo nano /etc/cron.daily/rkhunter.sh
```
Скрипт:
```bash
#!/bin/bash
sudo rkhunter --update
/usr/bin/rkhunter -c --cronjob 2>&1 | mail -s "RKhunter Scan Results" omeldarl@rambler.ru
```
Заменяем email-адрес Васи на свой и делаем скрипт исполняемым:
```bash
sudo chmod +x /etc/cron.daily/rkhunter.sh
```

Ее, кстати, можно добавить перед командой проверки в cron-сценарий. Еще два инструмента поиска руткитов:

```bash
sudo apt-get install tiger
sudo tiger
sudo apt-get install lynis
sudo lynis -c
```

debsums — инструмент для сверки контрольных сумм файлов, установленных пакетов с эталоном.
```bash
sudo apt-get install debsums
sudo debsums -ac
```






##Базовые настройка сервера

###Установка часового пояса
```bash
sudo dpkg-reconfigure tzdata
sudo /etc/init.d/cron stop
sudo /etc/init.d/cron start
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
```

###[Установить Node.js](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/):
```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm install node
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
sudo ufw allow from 94.51.209.173 to any port 27017
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
pm2 start npm -- start
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