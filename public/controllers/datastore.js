//
// Controllers for the Monitor Application.
//
angular.module('Monitor', [])

  //
  // DataStore interaction.
  //
  .controller('DataStoreController', ['$http', function ($http) {
    var self = this
    self.submit = function () {
      console.log('Form submitted: ' + this.resourceid)
    }
  }])
