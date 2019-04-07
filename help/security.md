##Настройка безопасности

###Отключение доступа по паролю
Для того, чтобы доступ к серверу мог осуществляться только по ключу, необходимо запретить авторизацию по паролю. Для этого требуется внести правки в файл /etc/ssh/sshd_config.

* Откройте файл командой:
```bash
sudo nano /etc/ssh/sshd_config
```
* Откройте файл /etc/ssh/sshd_config . В зависимости от Linux-дистрибутива, строка PasswordAuthentification может присутствовать в файле в закомментированном виде (# в начале строки) или отсутствовать – соответственно раскомментируйте или добавьте ее (PasswordAuthentification no).

* (Стоит уточнить)Для запрет ssh-подключения от имени root-пользователя. Найдите в нем строку PermitRootLogin  и замените ее значение на: PermitRootLogin  no.

* Сохраните изменения, после чего перезапустите службу SSH:
```bash
sudo service ssh restart
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

