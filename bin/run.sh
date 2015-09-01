#!/bin/bash

#
# Configuring MongoDB.
#
make mongo

#
# Running application in development environment.
#
pm2 start server.js --no-daemon
