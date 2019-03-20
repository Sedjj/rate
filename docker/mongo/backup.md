Сделать дам на сервере
```bash
mongodump --gzip -d rateBot --archive="/home/rb-app/rate_bot/mongoDB/dump/rateBot-20.03.gz"
```

Востановление из бэкапа
```bash
mongorestore --gzip --drop -d rateBot --archive="/data/dump/rateBot-20.03.gz"
```

Обновить данные на компе
```bash
mongorestore --gzip --drop -d rateBot --archive="rateBot-10.02.gz"
```

Скопировать файл в докер
```bash
COPY "D:\git\bot\rate\mongoDB\dump\rateBot-20.03.gz" "localhost:27017/data/dump/rateBot-20.03.gz"
```


Экспорт коллекции
```bash
mongoexport -d rateBot -c statistics -o statistics.json
```

Копировать из докера нужный файл: где `nostalgic_kalam` находится через `docker ps` и берется поле `name`
```bash
docker cp  nostalgic_kalam:\data\db\statistics.json D:\git\bot\rate\mongoDB\dump
```

Удалить данные из базы через консоль
```mongo
mongo rateBot
db.statistics.drop();
```