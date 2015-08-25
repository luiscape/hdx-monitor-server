//
// Controller for the dashboard
// page. It loads data from 2 services:
// -- Ageing Service
// -- Scraper Status Service
//
app.controller('DashboardController', ['$http', '$filter', '$location',
  function ($http, $filter, $location) {
    var self = this
    var f = $filter('filter')

    //
    // Hover functions.
    //
    self.hoverIn = function (d) {
      d.hover_last_updated = true
    }

    self.hoverOut = function (d) {
      d.hover_last_updated = false
    }

    //
    // Function to visit an URL.
    //
    self.go = function (url) {
      console.log(url)
      $location.path(url)
    }

    $http.get('service_data/dataset_age_mock_data.json')
      .then(
        function (response) {
          self.success = true

          //
          // Adding labels
          //
          var frequency_types = {
            '1': 'Every day',
            '6': 'Every week',
            '13': 'Every two weeks',
            '30': 'Every month',
            '89': 'Every three months',
            '179': 'Every six months',
            '364': 'Every year',
          }
          for (var i = 0; i < response.data.results.length; i++) {
            response.data.results[i].frequency_label = frequency_types[response.data.results[i].frequency]
          }

          //
          // Organizing results.
          //
          self.delinquent = f(response.data.results, { status: 'Delinquent' })
          self.uptodate = f(response.data.results, { status: 'Up-to-date' })
          self.archived = f(response.data.results, { status: 'Archived' })
          self.overdue = f(response.data.results, { status: 'Overdue' })
          self.due = f(response.data.results, { status: 'Due' }, true)

          //
          // Inspecting.
          //
          // console.log(self)

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

app.controller('ModalController', ['$http', '$modal', '$log',
  function ($http, $modal, $log) {
    var self = this
    self.animationsEnabled = true

    self.open = function (dataset_id) {
      $http.get('http://data.hdx.rwlabs.org/api/action/package_show?id=' + dataset_id)
        .then(
          function (response) {
            self.success = true

            var modalInstance = $modal.open({
              templateUrl: 'test.html',
              controller: 'ModalInstanceController',
              resolve: {
                data: function () {
                  return response.data.result
                }
              }
            })

            modalInstance.result.then(function (selectedItem) {
              self.selected = selectedItem
            }, function () {
              $log.info('Modal dismissed at: ' + new Date())
            })

          },
          function (response) {
            self.success = false,
            self.message = 'Could not connect to HDX.'
            console.log(response.data)
          }
      )
    }

  }])

// Please note that $modalInstance represents a modal window (instance) dependency.
  // It is not the same as the $modal service used above.

app.controller('ModalInstanceController',
  function ($scope, $modalInstance, data) {
    var self = $scope
    self.dataset = data

    console.log('my title is: ' + data.title)

    self.visit = function () {
      console.log('Visiting: https://data.hdx.rwlabs.org/dataset/' + data.id)
    }

    self.email = function () {
      console.log('Emailing maintainer.')
    }

    self.archive = function () {
      console.log('Archiving dataset.')
    }
  })
