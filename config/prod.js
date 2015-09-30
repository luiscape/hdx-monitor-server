module.exports = {
  'CkanInstance': 'https://data.hdx.rwlabs.org/',
  'DefaultApiKey': process.env.DEFAULT_API_KEY || null,
  'version': 'v.0.1.7',
  'repository': 'https://github.com/luiscape/hdx-monitor-server',
  'port': process.env.PORT || 8080,
  'services': {
    'datastore': {
      'host': '',
      'port': ''
    },
    'orgstats': {
      'host': 'localhost',
      'port': '2000'
    }
  }
}
