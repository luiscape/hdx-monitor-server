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
    self.organization = {}

    //
    // Internal wrapper function for
    // generating the bar charts.
    //
    var _bar = function (divid, data) {
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
        color: { pattern: [ '#f1c40f', '#f39c12' ] },
        size: {
          height: 220
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
    // Fetches a historic time-series from orgstats.
    //
    var _historic = function (_id, callback) {
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
              'error': response.data
            }
            callback(out)
          }
      )
    }

    self.hdx = function (_id) {
      var u = 'https://data.hdx.rwlabs.org/api/3/action/organization_show?id=' + _id
      $http.get(u)
        .then(
          function (response) {
            self.organization.details = response.data.result
          },
          function (response) {
            self.organization.details = response.data
          }
      )
    }

    //
    // Fetches an organization list from HDX.
    //
    self.list = function (callback) {
      var u = 'https://data.hdx.rwlabs.org/api/3/action/organization_list'
      self.organizations = []
      $http.get(u)
        .then(
          function (response) {
            //
            // For development.
            //
            var org
            for (i = 0; i < response.data.result.length; i++) {
              org = {
                'id': response.data.result[i],
                'data': null
              }
              self.organizations.push(org)
            }
          },
          function (response) {
            self.organizations.push(org)
          }
      )
    }

    //
    // Fetches the details from orgstats.
    //
    self.details = function (_id, callback) {
      $http.get('/api/orgstats/' + _id)
        .then(
          function (response) {
            self.organization.stats = response.data
          },
          function (response) {
            console.log(response.data)
          }
      )
    }

    //
    // Generates a bar chart with the
    // historic data from an organization.
    //
    self.chart = function (_id) {
      _historic(_id, function (err, data) {
        if (err) {
          console.log('Failed to make chart ' + _id)
          console.log(data)
        } else {
          var divid = '#chart-' + _id
          console.log('Making chart on ' + divid)
          _bar(divid, data)
        }
      })
    }

  }]
)
