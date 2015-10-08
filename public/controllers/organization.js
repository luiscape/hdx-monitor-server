//
// The organization controller performs two actions:
//
//  - Fetches a list of organization ids from the HDX API.
//  - Uses those ids to query the orgstats micro-service
//    for detailed statistics about each organization.
//
app.controller('OrganizationController', ['$http', '$scope', 'ngProgressFactory',
  function ($http, $scope, ngProgressFactory) {
    var self = this

    //
    // Fetches an organization list from HDX.
    //
    self.list = function (callback) {
      self.organizations = []
      $http.get('https://data.hdx.rwlabs.org/api/3/action/organization_list')
        .then(
          function (response) {
            //
            // For development.
            //
            var org = {
              'id': 'ocha-fts',
              'data': null
            }
            self.historic('ocha-fts', function (err, data) {
              if (err) {
                self.organizations.push(org)
              } else {
                org.data = data
                self.organizations.push(org)
              }
            })
            console.log(self.organizations)
          },
          function (response) {
            self.organizations.push(org)
          }
      )

      //
      // Generating bar charts.
      //
      for (var i = 0; i < self.organizations.length; i++) {
        self.chart(self.organizations[i].data)
      }
    }

    //
    // Fetches a historic time-series from orgstats.
    //
    self.historic = function (_id, callback) {
      console.log('Querying:' + '/api/orgstats/historic/' + _id)
      $http.get('/api/orgstats/historic/' + _id)
        .then(
          function (response) {
            //
            // Adds the historic API
            // data to the organizations
            // object.
            //
            callback(null, response.data)
          },
          function (response) {
            var out = {
              'success': false,
              'message': 'Could not fetch historic data from orgstats.',
              'organization': _id,
              'error': response
            }
            callback(out)
            console.log(out)
          }
      )
    }

    //
    // Fetches the details from orgstats.
    //
    self.details = function () {}

    //
    // Generates a bar chart with the
    // historic data from an organization.
    //
    self.chart = function (data) {
      var divid = '#chart-' + data.organization

      console.log('Generating graph.')
      console.log(data)

      c3.generate({
        bindto: divid,
        data: {
          x: 'date',
          x_format: '%Y-%m-%d',
          json: data.result.records,
          keys: {
            value: ['date', 'total_views', 'total_downloads'],
          },
          labels: false,
          selection: {
            enabled: false,
            grouped: false,
            multiple: false,
          },
          type: 'bar',
          groups: [
            ['total_views', 'total_downloads']
          ]
        },
        bar: {
          width: {
            ratio: 0.9
          }
        },
        point: {
          show: false
        },
        legend: {
          show: false
        },
        padding: {
          top: 0,
          bottom: -6,
          right: 5,
          left: 5
        },
        color: { pattern: [ '#ecf0f1', '#bdc3c7' ] },
        size: {
          height: 57
        },
        tooltip: {
          show: false
        },
        axis: {
          x: {
            show: false,
            type: 'timeseries',
            max: '2015-10-30',
            min: '2015-10-01',
            tick: {
              format: '%Y-%m-%d',
              count: 30,
              culling: {
                max: 4
              }
            }
          },
          y: {
            show: false
          }
        }
      })

    }

    //
    // Runs on load.
    //
    self.list(self.fetch)

  }]
)
