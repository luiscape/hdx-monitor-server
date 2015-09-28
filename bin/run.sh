#!/bin/bash

#
# Configuring MongoDB.
#
make configure

#
# Running application in development environment.
#
pm2 start server.js --no-daemon
