/*

    DASHBOARD CONTROLLER: -------

    Controller for most functions available in the
    dashboard page. This controller connects to
    the Ageing Service through the relay API, generating
    UI elements that organize datasets based on their
    "freshness" status.

*/
app.controller('DashboardController', ['$http', '$scope', '$filter', '$location',
  function ($http, $scope, $filter, $location) {
    var self = this
    var f = $filter('filter')
    var orderBy = $filter('orderBy')

    //
    // Exctract CSV header.
    //
    self.csvHeader = function (data) {
      return Object.keys(data[0])
    }

    //
    // Hover functions.
    //
    self.hoverIn = function (d) {
      d.hover_last_updated = true
    }

    self.hoverOut = function (d) {
      d.hover_last_updated = false
    }

    $http.get('/api/ageservice/age?results_per_page=3000')
      .then(
        function (response) {
          if (response.data) {
            self.success = true

            //
            // Manually add labels to each dataset.
            //
            var frequency_labels = {
              '0': 'A',
              '7': 'W',
              '14': 'B',
              '30': 'M',
              '45': 'Q',
              '60': 'S',
              '365': 'Y'
            }

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

          } else {
            self.fail = {
              failure: true,
              message: 'Service not available.'
            }
          }
        },
        function (response) {
          self.fail = {
            failure: true,
            message: 'Service not available.'
          }
          console.log(response.data)
        }
    )
  }]
)

//
// Service for allowing controllers
// to share data.
//
app.service('modalData', function Data () {
  var data = this
  data.details = null
})

app.controller('ModalController',
  function ($http, $scope, $filter, $window, $uibModal, $log, modalData) {
    var self = this
    self.animationsEnabled = true

    //
    // Gets a unique list from array.
    // From: http://stackoverflow.com/questions/11688692/most-elegant-way-to-create-a-list-of-unique-items-in-javascript
    //
    function _unique (arr) {
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

      var unique_days = _unique(timestamp_array)

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
      $http.get('https://data.hdx.rwlabs.org/api/action/package_show?id=' + dataset.dataset_id)
        .then(
          //
          // If request is successful, process the
          // results and pass them to the modal.
          //
          function (response) {
            response.data.result.age = dataset.age
            response.data.result.age_status = dataset.status
            response.data.result.priority = $scope.$parent.$index

            var modalInstance = $uibModal.open({
              templateUrl: 'modal.html',
              controller: 'ModalInstanceController',
              controllerAs: 'instance',
              size: 'lg',
              resolve: {
                dataset: function () {
                  modalData.details = response.data
                  return modalData
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
              'message': 'Failed to retrieve data from HDX.'
            }

            var modalInstance = $uibModal.open({
              templateUrl: 'modal.html',
              controller: 'ModalInstanceController',
              controllerAs: 'instance',
              resolve: {
                dataset: function () {
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

  }
)

//
// Controller for the modal
// with details about datasets.
//
app.controller('ModalInstanceController', ['$scope', '$window', 'modalData',
  function ($scope, $window, modalData) {
    var self = $scope
    self.dataset = modalData.details
    $scope.dataset = modalData.details

    console.log($scope.dataset)

    self.visit = function () {
      console.log('Visiting: https://data.hdx.rwlabs.org/dataset/' + self.dataset.result.id)
      var e = 'https://data.hdx.rwlabs.org/dataset/' + self.dataset.result.id
      $window.open(e, '_blank')
    }

    self.email = function () {
      console.log('Emailing maintainer: ' + self.dataset.result.maintainer_email)

      //
      // Building emailing string.
      //
      var line_break = '%0A'
      var dataset_link = 'https://data.hdx.rwlabs.org/dataset/' + self.dataset.result.id
      var s = 'Please Update Your Dataset on HDX'
      var b = 'Dear ' + self.dataset.result.maintainer + ',' + line_break + line_break +
        'I am writing to you regarding the dataset "' + self.dataset.result.title + '" that you shared on HDX. ' +
        'We noticed that the dataset has not been updated in ' + self.dataset.result.age + ' days. ' + line_break + line_break +
        'We believe that the dataset is very important for the humanitarian community and we ' +
        'wonder if you could take a look at the dataset and update the data. Below is the link to the dataset: ' + line_break +
        line_break +
        dataset_link +
        line_break +
        line_break +
        'Thank you for sharing and please do not hesitate to get in touch with me if you have any questions.' + line_break + line_break +
        'Best regards,'

      //
      // Assembling email string.
      //
      var e = 'mailto:' + self.dataset.result.maintainer_email +
        '?body=' + b +
        '&subject=' + s

      //
      // Open new window with
      // email.
      //
      $window.open(e, '_blank')
    }

    // self.change_frequency = function (frequency) {
    //   console.log('Changing frequency of dataset dataset to ' + frequency + '.')
    //   var options = {
    //     method: 'POST',
    //     url: 'https://data.hdx.rwlabs.org/api/action/hdx_package_update_metadata',
    //     headers: {
    //       'Authorization': 'foo',
    //       'Content-Type': 'application/json'
    //     },
    //     data: {
    //       id: 'absolute-test-dataset-as-it-may-sound-indeed',
    //       data_update_frequency: frequency
    //     }
    //   }

    //   $http(options)
    //     .then(
    //       function (response) {
    //         console.log(response.data)
    //       },
    //       function (response) {
    //         console.log('Failed to change frequency.')
    //         console.log(response)
    //       }
    //   )

    // }

  }]
)
