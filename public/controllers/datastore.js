//
// DataStore interaction.
//
app.controller('DataStoreController', ['$http', 'ngProgressFactory', function ($http, ngProgressFactory) {
  var self = this
  self.submit = function () {
    self.progressbar = ngProgressFactory.createInstance()
    self.progressbar.start()
    $http.get('/api/datastore/create/' + this.resourceid)
    .then(
      function (response) {
        self.progressbar.complete()
        self.message = response.data.message
        if (response.data.success) {
          self.success = true
          self.failure = false
        } else {
          self.success = false
          self.failure = true
        }
        console.log(response.data)
      },
      function (response) {
        self.progressbar.complete()
        self.failure = true
        self.success = false
        self.message = 'Service not available.'
        console.log(response.data)
      })
  }
}])
