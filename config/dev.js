module.exports = {
  'CkanInstance': 'https://data.hdx.rwlabs.org/',
  'DefaultApiKey': process.env.DEFAULT_API_KEY || null,
  'version': 'v.0.1.14',
  'repository': 'https://github.com/luiscape/hdx-monitor-server',
  'port': process.env.PORT || 8080,
  'services': {
    'orgstats': {
      'host': 'orgstats',
      'port': 2000
    },
    'ageservice': {
      'host': 'ageservice',
      'port': 3000,
      'base': 'v1'
    },
    'datastore': {
      'host': 'datastore',
      'port': 5000
    },
    'funnelstats': {
      'host': 'funnelstats',
      'port': 7000
    }
  }
}
