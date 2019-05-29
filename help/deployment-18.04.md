# Развёртывание приложения на Ubuntu 18.04

##Настройка безопасности

### Создать пользователя `docker`:
```bash
sudo adduser docker
sudo adduser docker sudo
sudo gpasswd -a docker sudo
```
Войти в систему под пользователем `docker`.

Смена пароля root
```bash
sudo bash
passwd root
```

### Обновить список пакетов:
```bash
sudo apt-get update 
sudo apt-get upgrade
```

###Установка часового пояса
```bash
sudo dpkg-reconfigure tzdata &&
sudo /etc/init.d/cron stop &&
sudo /etc/init.d/cron start &&
timedatectl
```

### Настройка Docker compose
```bash
sudo apt install curl 
sudo curl -L https://github.com/docker/compose/releases/download/1.21.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Настройка Gitlab Runner
```bash
sudo curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

sudo gitlab-runner register -n \
  --url https://gitlab.com/ \
  --registration-token yre9monAkRxbuBfGhAkx \
  --executor shell \
  --description "Prod Runner" \
  --docker-privileged \
  --tag-list rate-shell
  
sudo gitlab-runner restart
```

Маленькая, но очень нужная настройка, добавление пользователя gitlab-runner в группу docker.
```bash
sudo usermod -aG docker gitlab-runner
```

Как только служба Docker настроена на автоматический запуск после перезагрузки VPS, все контейнеры Docker также будут запускаться автоматически. Все ваши приложения, работающие в контейнерах Docker, вернутся в онлайн без какого-либо ручного вмешательства.
```bash
sudo systemctl enable docker
```