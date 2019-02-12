#!/bin/bash

sudo adduser rb-app
sudo adduser rb-app sudo
sudo gpasswd -a rb-app sudo
sudo bash &&
passwd root
passwd rb-app


sudo apt-get update  &&
sudo apt-get upgrade &&
sudo dpkg-reconfigure tzdata &&
sudo /etc/init.d/cron stop &&
sudo /etc/init.d/cron start &&
timedatectl &&
sudo apt-get install htop &&
sudo apt-get install curl &&
sudo apt-get install build-essential libssl-dev &&
sudo curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash - &&
sudo apt-get install -y nodejs &&
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 &&
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" |
sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list &&
sudo apt-get update &&
sudo apt-get install -y mongodb-org &&
sudo nano /etc/systemd/system/mongodb.service




sudo systemctl unmask mongodb &&
sudo systemctl start mongodb.service &&
sudo systemctl enable mongodb &&
sudo systemctl status mongodb.service &&
mongo --eval 'db.runCommand({ connectionStatus: 1 })' &&
cd /home/rb-app &&
sudo mkdir rate_bot &&
sudo chown rb-app:rb-app rate_bot &&
sudo mkdir mongodb &&
sudo mkdir mongodb/db &&
sudo mkdir mongodb/log &&
sudo chown rb-app:rb-app mongodb &&
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++ &&
sudo npm install node-gyp &&
sudo npm install pm2@latest -g
