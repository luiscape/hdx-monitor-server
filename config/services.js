//
// Configuration file that holds information
// about all the services this application
// connects to.
//
// Offline objects provide data to when the
// service is offline.
//
module.exports = {
  'datastore': {
    'host': null,
    'port': null,
    'offline': {
      'online': false,
      'message': 'Service for creating datastores on a CKAN instance.',
      'CKAN_instance': 'https://data.hdx.rwlabs.org/',
      'version': 'v.0.1.3',
      'repository': 'https://github.com/luiscape/hdx-monitor-datastore'
    }
  },
  'ageing_service': {
    'host': null,
    'port': null,
    'offline': {
      'online': false,
      'message': 'Service for calculating the age of datasets on HDX.',
      'CKAN_instance': 'https://data.hdx.rwlabs.org/',
      'version': 'v.0.3.5',
      'repository': 'https://github.com/reubano/hdx-monitor-dataset-age'
    }
  },
  'funnel_stats': {
    'host': null,
    'port': null,
    'offline': {
      'online': false,
      'message': 'Service for collecting statistics about HDX.',
      'version': 'v.0.1.2',
      'repository': 'https://github.com/luiscape/hdx-monitor-funnel-stats'
    }
  },
  'org_stats': {
    'host': null,
    'port': null,
    'offline': {
      'online': false,
      'message': 'Service for collecting statistics about organizations in HDX.',
      'version': 'v.0.3.2',
      'repository': 'https://github.com/luiscape/hdx-monitor-org-stats'
    }
  },
  'download_search': {
    'host': null,
    'port': null,
    'offline': {
      'online': false,
      'message': 'Service that turns a CKAN search query into a downloadable CSV file.',
      'CKAN_instance': 'https://data.hdx.rwlabs.org',
      'version': 'v.0.1.2',
      'repository': 'https://github.com/luiscape/hdx-monitor-download-search'
    }
  }

}
