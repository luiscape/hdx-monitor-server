############################################################
# Dockerfile to build the HDX Monitor Server application
# Based on Node. Receives links from a MongoDB container.
############################################################

FROM node:0.12.7

MAINTAINER Luis Capelo <capelo@un.org>

#
# Clone and install dependencies.
#
RUN \
  npm install -g pm2 && \
  git clone https://github.com/luiscape/hdx-monitor-server && \
  cd hdx-monitor-server && \
  npm install

WORKDIR "/hdx-monitor-server"

EXPOSE 8080

CMD ["make", "run"]
