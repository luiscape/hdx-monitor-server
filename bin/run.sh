#!/bin/bash

#
# Export environment variables for development.
#
export MONGODB_USER_NAME=foo
export MONGODB_USER_PASSWORD=bar
export MONGODB_DATABASE=baz
export MONGO_PORT_27017_TCP_ADDR=127.0.0.1
export DATASTORE_PORT_5000_TCP_ADDR=127.0.0.1
export DATASTORE_PORT_5000_TCP_PORT=5000
export DATASTORE_PORT=5000  # default
export FUNNEL_STATS_PORT=7000  #default

#
# Running application in development environment.
#
nodemon server.js
