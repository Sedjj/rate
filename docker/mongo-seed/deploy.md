Удаление всех контейнеров
```bash
docker system prune -a --volumes
```

Сборка контейнера
```bash
docker build -t mongo-rate -f docker/mongo/DockerFile .
```

Запуск Контейнера
```bash
docker run -p 27017:27017 -i -t mongo-rate
```

Проверка что все данные подтянулись
```bash
ls /data/dump/
ls /data/log/
ls /data/scripts/

apt-get update && apt-get install nano
nano /data/mongo.sh
```