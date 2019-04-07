FROM mongo

# Copy db
COPY docker/mongo-seed/dump/ /data/dump/

# Copy scripts
COPY docker/mongo-seed/scripts /data/scripts/

# Copy mongo.sh
COPY docker/mongo-seed/docker-entrypoint.sh /usr/local/bin/

RUN ln -s /usr/local/bin/docker-entrypoint.sh /entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["mongoDB"]