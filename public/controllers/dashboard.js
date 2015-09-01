//
// Controller for the dashboard
// page. It loads data from 2 services:
// -- Ageing Service
// -- Scraper Status Service
//
app.controller('DashboardController', ['$http', '$scope', '$filter', '$location',
  function ($http, $scope, $filter, $location) {
    var self = this
    var f = $filter('filter')
    var orderBy = $filter('orderBy')

    //
    // Hover functions.
    //
    self.hoverIn = function (d) {
      d.hover_last_updated = true
    }

    self.hoverOut = function (d) {
      d.hover_last_updated = false
    }

    $http.get('/api/dataset_age/age?results_per_page=1000')
      .then(
        function (response) {
          self.success = true

          var frequency_labels = {
            '0': 'A',
            '7': 'W',
            '14': 'B',
            '30': 'M',
            '45': 'Q',
            '60': 'S',
            '365': 'Y'
          }

          //
          // Adding labels to each dataset.
          //
          for (i = 0; i < response.data.objects.length; i++) {
            response.data.objects[i].frequency_label = frequency_labels[response.data.objects[i].frequency]
          }

          //
          // Organizing results.
          //
          self.delinquent = f(response.data.objects, { status: 'Delinquent', frequency_category: '!Archived' }, true)
          self.uptodate = f(response.data.objects, { status: 'Up-to-date', frequency_category: '!Archived' }, true)
          self.archived = f(response.data.objects, { frequency_category: 'Archived' }, true)
          self.overdue = f(response.data.objects, { status: 'Overdue', frequency_category: '!Archived' }, true)
          self.due = f(response.data.objects, { status: 'Due for update', frequency_category: '!Archived' }, true)

        },
        function (response) {
          self.fail = {
            failure: true,
            message: 'Service not available.'
          }
          console.log(response.data)
        }
    )
  }])

app.controller('ModalController', ['$http', '$scope', '$filter', '$window', '$modal', '$log',
  function ($http, $scope, $filter, $window, $modal, $log) {
    var self = this
    self.animationsEnabled = true

    //
    // Gets a unique list from array.
    // From: http://stackoverflow.com/questions/11688692/most-elegant-way-to-create-a-list-of-unique-items-in-javascript
    //
    function unique (arr) {
      var u = {}, a = []
      for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
          a.push(arr[i])
          u[arr[i]] = 1
        }
      }
      return a
    }

    //
    // Count the number of
    // observations per minute.
    //
    var calculateBins = function (response_data, callback) {
      var out = [], temp = []
      var timestamp = null
      var timestamp_array = []
      var f = $filter('filter')

      for (var i = 0; i < response_data.length; i++) {
        timestamp = moment(response_data[i].timestamp).format('YYYY-MM-DD')
        timestamp_array.push(timestamp)
        temp.push({ 'day': timestamp, 'count': null })
      }

      var unique_days = unique(timestamp_array)

      for (var i = 0; i < unique_days.length; i++) {
        var same_day_items = f(temp, { day: unique_days[i] }, true)
        var t = { 'day': unique_days[i], 'count': same_day_items.length }
        out.push(t)
      }

      callback(out)
    }

    //
    // Generates a C3 bar chart.
    //
    var generateGraph = function (data) {
      var c3 = $window.c3
      c3.generate({
        bindto: '#activity-bar-chart',
        size: {
          height: 200
        },
        padding: {
          top: 0,
          right: 40,
          bottom: 0,
          left: 40,
        },
        data: {
          json: data,
          mimeType: 'json',
          keys: {
            x: 'day',
            value: ['day', 'count']
          },
          type: 'bar'
        },
        axis: {
          x: {
            type: 'timeseries',
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
        },
        bar: {
          width: {
            ratio: 0.6 // this makes bar width 50% of length between ticks
          }
        },
        color: {
          pattern: ['#34495e']
        },
        legend: {
          show: false
        }
      })
    }

    self.order = function (reverse) {
      console.log('change order')
      $scope.dataset = orderBy($scope.dataset, 'downloads', reverse)
    }

    self.open = function (dataset) {
      $http.get('http://data.hdx.rwlabs.org/api/action/package_show?id=' + dataset.dataset_id)
        .then(
          function (response) {
            response.data.result.age = dataset.age
            response.data.result.age_status = dataset.status
            response.data.result.priority = $scope.$parent.$index

            var modalInstance = $modal.open({
              templateUrl: 'test.html',
              controller: 'ModalInstanceController',
              resolve: {
                data: function () {
                  return response.data
                }
              }
            })

            modalInstance.result.then(function (selectedItem) {
              self.selected = selectedItem
            }, function () {
              $log.info('Modal dismissed at: ' + new Date())
            })

          },

          //
          // If fail, still loads
          // the modal with a failure message.
          //
          function (response) {
            var fail_message = {
              'success': false,
              'message': 'Could not connect to HDX.'
            }

            var modalInstance = $modal.open({
              templateUrl: 'test.html',
              controller: 'ModalInstanceController',
              resolve: {
                data: function () {
                  return fail_message
                }
              }
            })

            modalInstance.result.then(function (selectedItem) {}, function () {
              $log.info('Modal dismissed at: ' + new Date())
            })
          }
      )
    }

    //
    // Fetches revision data from HDX.
    //
    self.fetch = function (dataset_id) {
      self.chart = {}
      $http.get('https://data.hdx.rwlabs.org/api/3/action/package_revision_list?id=' + dataset_id)
        .then(
          function (response) {
            self.chart.success = true
            calculateBins(response.data.result, generateGraph)
          },
          function (response) {
            self.chart.success = false
            console.log('Failed to collect revision ids.')
          }
      )
    }

    //
    // Adds checked icon to dataset.
    //
    self.checked = function (dataset) {
      $scope.dataset.checked = true
    }

  }])

// Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

app.controller('ModalInstanceController',
  function ($scope, $modalInstance, data) {
    var self = $scope
    self.dataset = data

    self.visit = function () {
      console.log('Visiting: https://data.hdx.rwlabs.org/dataset/' + self.dataset.result.id)
    }

    self.email = function () {
      console.log('Emailing maintainer.')
    }

    self.change_frequency = function () {
      console.log('Changing frequency of dataset dataset.')
    }
  })
