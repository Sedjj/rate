Сделать дам на сервере
```bash
mongodump ---gzip --archive --db rateBot --out /home/rb-app/rate_bot/mongoDB/dump/
```

Скопировать с докера на комп
```bash

```

Обновить данные на компе
```bash
mongorestore --gzip --drop -d rateBot --archive="rateBot-19.01.gz"
```

Удалить данные из базы через консоль
```mongo
mongo rateBot
db.statistics.drop();
```