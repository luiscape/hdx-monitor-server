## HDX Monitor Server
Helps organize the micro-services that make the HDX Monitor.

## Running Docker Container
Adapt the following command to run a Docker container with the HDX Monitor locally:

```shell
$ docker run -d --name server \
  -e MONGODB_USER_NAME=foo \
  -e MONGODB_USER_PASSWORD=bar \
  -e MONGODB_DATABASE=baz \
  -e DATASTORE_PORT=5000 \
  -e FUNNEL_STATS_PORT=7000 \
  -p 127.0.0.1:8080:8080 \
  --link mongo \
  --link datastore \
  luiscape/hdx-monitor-server:latest
```
