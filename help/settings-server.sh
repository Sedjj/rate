#!/bin/bash

sudo adduser rb-app &&
sudo adduser rb-app sudo &&
sudo gpasswd -a rb-app sudo &&
sudo apt-get update &&
sudo apt-get upgrade &&
sudo dpkg-reconfigure tzdata &&
sudo /etc/init.d/cron stop &&
sudo /etc/init.d/cron start &&
timedatectl &&
sudo apt-get install htop &&
sudo apt-get install curl &&
sudo curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash - &&
sudo apt-get install -y nodejs &&
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 &&
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.1 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list &&
sudo apt-get update &&
sudo apt-get install -y --allow- mongodb-orgunauthenticated