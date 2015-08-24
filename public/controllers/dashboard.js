//
// Controller for the dashboard
// page. It loads data from 2 services:
// -- Ageing Service
// -- Scraper Status Service
//
app.controller('DashboardController', ['$http', '$filter',
  function ($http, $filter) {
    var self = this
    var f = $filter('filter')
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

          self.delinquent = f(response.data.results, { status: 'Delinquent' })
          self.uptodate = f(response.data.results, { status: 'Up-to-date' })
          self.overdue = f(response.data.results, { status: 'Overdue' })
          self.due = f(response.data.results, { status: 'Due' })
          console.log(self)
        },
        function (response) {
          self.fail = {
            failure: true,
            message: 'Service not available.'
          }
          console.log(response.data)
        })
  }])
