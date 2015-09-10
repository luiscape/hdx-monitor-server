## HDX Monitor Server
Helps organize the micro-services that make the HDX Monitor.

![Screengrab v.0.1.0](screengrab.png)

## Running Docker Container
Adapt the following command to run a Docker container with the HDX Monitor locally:

```shell
$ docker run -d --name server \
  -e MONGODB_USER_NAME=foo \
  -e MONGODB_USER_PASSWORD=bar \
  -e MONGODB_DATABASE=baz \
  -e SESSION_PASSWORD=foobarbaz \
  -p 127.0.0.1:8080:8080 \
  --link mongo \
  --link datastore \
  luiscape/hdx-monitor-server:latest
```
