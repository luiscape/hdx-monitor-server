//
// DataStore interaction.
//
app.controller('DataStoreController', ['$http', '$scope', '$sce', 'ngProgressFactory',
  function ($http, $scope, $sce, ngProgressFactory) {
    var self = this

    var _qs = function (obj, prefix) {
      var str = []
      for (var p in obj) {
        var k = prefix ? prefix + '[' + p + ']' : p,
          v = obj[p]
        str.push(angular.isObject(v) ? qs(v, k) : (k) + '=' + encodeURIComponent(v))
      }
      return str.join('&')
    }

    //
    // Submits a datastore query.
    //
    self.submit = function () {
      self.progressbar = ngProgressFactory.createInstance()
      self.progressbar.start()

      //
      // Parsing payload from from.
      //
      var payload = {
        'id': [],
        'type': []
      }
      for (var i = 0; i < this.fields.length; i++) {
        payload.id.push(this.fields[i].field_name)
        payload.type.push(this.fields[i].type)
      }

      //
      // Cleaning payload in case
      // the datastore application
      // notices there is an empty object.
      //
      if (payload.id.length === 0) {
        payload = null
      }
      var options = {
        method: 'POST',
        url: '/api/datastore/create/' + this.resourceid,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      }
      console.log('Sending payload: ' + JSON.stringify(payload))
      $http(options)
        .then(
          function (response) {
            self.progressbar.complete()
            self.message = response.data.message

            //
            // Please fix this redundance.
            //
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

    //
    // Add a field to the schema.
    //
    this.fields = []
    this.field_index = false
    self.add_schema_field = function () {
      //
      // Fields HTML.
      //
      this.field_index += 1
      console.log('Adding field to schema. Field index: ' + this.field_index)
      var newItemNo = this.fields.length + 1
      this.fields.push({'id': 'choice' + newItemNo})
    }

    self.remove_schema_field = function (schema_field) {
      var lastItem = this.fields.length - 1
      this.fields.splice(lastItem)
    }
  }])
