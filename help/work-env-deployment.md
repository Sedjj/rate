# Развёртывание рабочего окружения

Клонировать проект:

```bash
git clone git@gitlab.com:developmentKit/projects/bot/rate.git
```

Установить зависимости:

```bash
npm install
```

Установить windows-build-tools (для Osmosis):
```bash
npm install -g windows-build-tools
```

## Настройка WebStorm

Импортировать code style из файла `WebStormCodeStyle.xml`:

![code-style-import](assets/code-style-import.png)

Включить поддержку ESLint:

![enable-eslint](assets/enable-eslint.png)

Включить поддержку NodeJs библиотеки:

![enable-nodejs-core](assets/enable-nodejs-core.png)

Настроить конфигурации запуска:

![debug-config](assets/debug-config.png)

![start-config](assets/start-config.png)

![dockerFile-config](assets/dockerFile-config.png)

![prod-remote-debug-config](assets/prod-remote-debug-config.png)

![help-api-config](assets/help-api-config.png)
