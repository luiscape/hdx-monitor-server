#!/bin/bash

#
# Creates an user in the
# MongoDB instance.
#
mongo $MONGODB_DATABASE --eval "db.createUser({user: '$MONGODB_USER_NAME', pwd: '$MONGODB_USER_PASSWORD', roles: [{ role: 'readWrite', db: '$MONGODB_DATABASE' },]})"


#
# Running application in development environment.
#
pm2 start server.js --no-daemon
