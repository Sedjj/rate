# Create image based on the official mongo image from the dockerhub
FROM mongo

# Create a directory where our app will be placed
RUN mkdir -p /data/log/

# Copy db
COPY mongoDB/dump/ /data/dump/

# Copy mongo.sh
# COPY mongoDB/mongo.sh /usr/local/bin/

# Copy scripts
COPY mongoDB/scripts /data/scripts/

# Запуск импорта
#CMD mongoimport --host localhost --port 27017 --type json --collection tabletennis --mode merge --db rateBot --file data/dump/tabletennis.json