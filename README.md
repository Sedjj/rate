# Бот для Ставок

Пример простого бота для сбора статистики на NodeJS.


## Подготовка к использованию
* Укажите конфигурацию в ```default.json```.
* Запуск проекта для разработки с помощью ```npm run dev```.
* Запуск проекта в продакшен с помощью ```npm run dev```.
* Генерация докуов проекта с помощью ```npm run docs```.

## Описание файлов
- ```index.js``` - Точка входа в приложение
- ```telegramApi/index.js``` - API для взаимодействием с телеграмм.
- ```storage/index.js``` - API для взаимодействием с БД.
- ```searchMatch/index.js``` - Математические методы расчета ставок.
- ```models/index.js``` - Модели для запись в БД.
- ```fetch/index.js``` - API для отправки запросов.

## Help
- [cron](https://www.npmjs.com/package/node-cron) тут можно подсмотреть как настроить cron.
``` 
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * * 
```
#####Using step values
Step values can be used in conjunction with ranges, following a range with '/' and a number. 
e.g: 1-10/2 that is the same as 2,4,6,8,10. Steps are also permitted after an asterisk, 
so if you want to say “every two minutes”, just use */2.

```js
var cron = require('node-cron');
cron.schedule('*/2 * * * *', () => {
  console.log('running a task every two minutes');
});
```

License
----

MIT
