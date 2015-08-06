#!/bin/bash

#
# Export environment variables for development.
#
export MONGODB_USER_NAME=foo
export MONGODB_USER_PASSWORD=bar
export MONGODB_DATABASE=baz
export MONGODB_LOCATION_URL=172.17.0.3:27017  # relative
export DATASTORE_PORT=5000  # default

#
# Running application in development environment.
#
nodemon server.js