###Создадим docker-compose.yml файл.
Вот с таким содержимым:
```dockerfile
version: "2"
services:
  mtproxy:
    image: telegrammessenger/proxy:latest
    container_name: mtproxy
    ports:
      - "443:443"
    volumes:
      - ./proxy-config:/data
    restart: always
    logging:
      driver: syslog
      options:
        tag: mtproxy
```

###Настройка и инициализация
Далее нужно задать адрес сервер `docker-compose run --rm openvpn ovpn_genconfig -u udp://IP.ИЛИ.ДОМЕН.ВАШЕГО.СЕРЕРА`
```bash
docker-compose run --rm mtproxy
```

###Запуск
```bash
docker-compose up -d
```

###обновить образ
```bash
docker-compose pull mtproxy
```

###посмотреть журнал сервиса
```bash
docker-compose logs -f --tail=30 mtproxy
```

###Полное удаление
```bash
docker-compose run --rm mtproxy
```