module.exports = {
  'CkanInstance': 'https://data.hdx.rwlabs.org/',
  'DefaultApiKey': process.env.DEFAULT_API_KEY || null,
  'version': 'v.0.1.12',
  'repository': 'https://github.com/luiscape/hdx-monitor-server',
  'port': process.env.PORT || 8080,
  'services': {
    'datastore': {
      'host': 'datastore',
      'port': 2000
    },
    'ageservice': {
      'host': 'ageservice',
      'port': 3000,
      'base': 'v1'
    },
    'orgstats': {
      'host': 'orgstats',
      'port': 5000
    },
    'funnelstats': {
      'host': 'funnelstats',
      'port': 7000
    }
  }
}
