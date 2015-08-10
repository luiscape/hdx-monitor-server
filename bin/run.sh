#!/bin/bash

#
# Export environment variables for development.
#
export MONGODB_USER_NAME=hdxmonitor
export MONGODB_USER_PASSWORD=Dp1mhPZNj2
export MONGODB_DATABASE=hdxmonitor
export MONGODB_LOCATION_URL=172.17.0.5:27017  # relative
export DATASTORE_PORT=5000  # default
export FUNNEL_STATS_PORT=7000  #default

#
# Running application in development environment.
#
nodemon server.js