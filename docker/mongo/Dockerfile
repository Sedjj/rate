# Create image based on the official mongo image from the dockerhub
FROM mongo

# Create a directory where our app will be placed
RUN mkdir -p /data/log/

# Copy db
COPY mongoDB/dump/ /data/dump/

# Copy mongo.sh
COPY mongoDB/mongo.sh /usr/local/bin/

# Copy scripts
COPY mongoDB/scripts /data/scripts/

# RUN mongod --logpath=/data/log/mongodb.log && sleep 20 && \
# mongorestore --gzip --drop -d rateBot --archive="data/dump/rateBot.gz" && \
# mongo 127.0.0.1:27017/rateBot /data/scripts/index.js
ENTRYPOINT ["mongo.sh"]

# CMD ["/data/mongo.sh"]