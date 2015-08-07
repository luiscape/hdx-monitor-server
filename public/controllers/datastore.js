//
// DataStore interaction.
//
app.controller('DataStoreController', ['$http', function ($http) {
  var self = this
  self.submit = function () {
    console.log('Form submitted: ' + this.resourceid)
  }
}])
