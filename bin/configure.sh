#!/bin/sh

#
# Creates an user in the
# MongoDB instance.
#
mongo $MONGO_PORT_27017_TCP_ADDR:27017/$MONGODB_DATABASE \
  --eval "db.createUser({user: '$MONGODB_USER_NAME', pwd: '$MONGODB_USER_PASSWORD', roles: [{ role: 'readWrite', db: '$MONGODB_DATABASE' },]})"
