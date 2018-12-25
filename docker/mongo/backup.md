Полный бэкап базы
```bash
mongodump --gzip -d rateBot --archive="/home/rb-app/mongodb/db/rateBot-04.12.gz"
```

Востановление из бэкапа
```bash
mongorestore --gzip --drop -d rateBot --archive="/data/db/db/rateBot-04.12.gz" 
```

```bash
COPY "D:\git\bot\rate\mongoDB\db\rateBot-04.12.gz" "localhost:27017/data/db/rateBot-04.12.gz"
```


Экспорт коллекции
```bash
mongoexport -d rateBot -c statistics -o statistics.json
```

Копировать из докера нужный файл: где `nostalgic_kalam` находится через `docker ps` и берется поле `name`
```bash
docker cp  nostalgic_kalam:\data\db\statistics.json D:\git\bot\rate\mongoDB\dump
```