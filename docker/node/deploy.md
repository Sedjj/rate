Удаление всех контейнеров
```bash
docker system prune -a --volumes
```

Сборка контейнера
```bash
docker build --rm -t rate -f docker/node/DockerFile .
```

Запуск Контейнера
```bash
docker run -p -i -t rate
```