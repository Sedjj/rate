####Сделать дам на сервере
```bash
mongodump --gzip -d rateBot --archive="/home/rb-app/rate_bot/mongoDB/dump/rateBot-06.04.gz"
```

####Востановление из бэкапа
```bash
mongorestore --gzip --drop -d rateBot --archive="/data/dump/rateBot-06.04.gz"
```

####Обновить данные на компе
```bash
mongorestore --gzip --drop -d rateBot --archive="rateBot-06.04.gz"
```

####Скопировать файл в докер
```bash
COPY "D:\git\bot\rate\mongoDB\dump\rateBot-06.04.gz" "localhost:27017/data/dump/rateBot-06.04.gz"
```

####Экспорт коллекции
```bash
mongoexport --type json --db rateBot --collection footballs --out data/dump/footballs.json
mongoexport --type json --db rateBot --collection tabletennis --out data/dump/tabletennis.json
```

####Импорт коллекции
```bash
mongoimport --type json --collection footballs --mode merge --db rateBot --file data/dump/footballs.json
mongoimport --type json --collection tabletennis --mode merge --db rateBot --file data/dump/tabletennis.json
```

####Копировать из докера нужный файл: где `nostalgic_kalam` находится через `docker ps` и берется поле `name`
```bash
docker cp  nostalgic_kalam:\data\db\statistics.json D:\git\bot\rate\mongoDB\dump
```

####Удалить данные из базы через консоль
```mongo
mongo rateBot
db.tabletennis.drop();
db.footballs.drop();
```