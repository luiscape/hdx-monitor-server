## HDX Monitor Server
Helps organize the micro-services that make the HDX Monitor.

![Screengrab v.0.1.0](screengrab.png)

## Services
The `hdx-monitor-server` depends on a number of services. The following table contains a summary of those services. All of them are available through the `/api` endpoint by using the service name:

| name           | port | description                                 |
|----------------|------|---------------------------------------------|
| `orgstats`     | 2000 | Calculates the statistics of organizations. |
| `ageservice`   | 3000 | Calculates the age of datasets.             |
| `datastore`    | 5000 | Creates DataStores for resources.           |
| `funnelstats`  | 7000 | Calculates usage statistics for HDX.        |

## Docker
[![](https://badge.imagelayers.io/luiscape/hdx-monitor-server:latest.svg)](https://imagelayers.io/?images=luiscape/hdx-monitor-server:latest 'Get your own badge on imagelayers.io')

This image can be run by itself, however many of its features will fail to work. Please refer to the `docker-compose.yml` file in the [HDX Monitor](https://github.com/luiscape/hdx-monitor) repository for information on how to run this application together with all its supporting services.
