###Создадим docker-compose.yml файл.
Вот с таким содержимым:
```dockerfile
version: '2'
services:
  openvpn:
    cap_add:
     - NET_ADMIN
    image: kylemanna/openvpn
    container_name: openvpn
    ports:
     - "1194:1194/udp"
    restart: always
    volumes:
     - ./openvpn-data/conf:/etc/openvpn
```

###Настройка и инициализация
Далее нужно задать адрес сервер `docker-compose run --rm openvpn ovpn_genconfig -u udp://IP.ИЛИ.ДОМЕН.ВАШЕГО.СЕРЕРА`
```bash
docker-compose run --rm openvpn ovpn_genconfig -u udp://45.77.142.224
```

###Инициализируем
Во время генерации сертификата введите контрольную фразу (Enter PEM pass phrase) и имя сертификата (Common Name). 
Везде пишем `rate`
```bash
docker-compose run --rm openvpn ovpn_initpki
```

###Запуск
```bash
docker-compose up -d openvpn
```

###Создание файла настроек с сертификатами
Для упрощения, зададим переменную окружения `export CLIENTNAME="название_вашего_клиента"`
```bash
export CLIENTNAME="rate"
```

Во время генерации сертификата введите контрольную фразу (Enter PEM pass phrase) и имя сертификата (Common Name).
```bash
docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME
```

Без кодовой фразы [не рекомендуется]
```bash
docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME nopass
```

Создаём конфигурационный файл с сертификатами.
```bash
docker-compose run --rm openvpn ovpn_getclient $CLIENTNAME > $CLIENTNAME.ovpn
```

###Отзыв клиентских сертификатов
С сохраниением ключей
```bash
docker-compose run --rm openvpn ovpn_revokeclient $CLIENTNAME
```

Полное удаление
```bash
docker-compose run --rm openvpn ovpn_revokeclient $CLIENTNAME remove
```