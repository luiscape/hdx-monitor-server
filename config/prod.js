module.exports = {
  'CkanInstance': 'https://data.hdx.rwlabs.org/',
  'DefaultApiKey': process.env.DEFAULT_API_KEY || null,
  'version': 'v.0.1.9',
  'repository': 'https://github.com/luiscape/hdx-monitor-server',
  'port': process.env.PORT || 8080,
  'services': {
    'orgstats': {
      'host': 'localhost',
      'port': 2000
    },
    'ageservice': {
      'host': 'localhost',
      'port': 3000
    },
    'datastore': {
      'host': 'localhost',
      'port': 5000
    },
    'funnelstats': {
      'host': 'localhost',
      'port': 7000
    }
  }
}
