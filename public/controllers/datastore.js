//
// DataStore interaction.
//
app.controller('DataStoreController', ['$http', '$scope', '$sce', 'ngProgressFactory',
  function ($http, $scope, $sce, ngProgressFactory) {
    var self = this

    //
    // Submits a datastore query.
    //
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

    var field_id_html = '<div class="col-xs-6">' +
      '<input type="text" class="form-control login-field schema-field-id">' +
      '</div>'
    var field_types_html = '<div class="col-xs-6">' +
      '<select class="selectpicker">' +
      '<option>text</option>' +
      '<option>json</option>' +
      '<option>date</option>' +
      '<option>time</option>' +
      '<option>timestamp</option>' +
      '<option>int</option>' +
      '<option>float</option>' +
      '<option>bool</option>' +
      '</select>' +
      '</div>'

    var fields_html = field_id_html + field_types_html

    //
    // Creates the schema fields.
    //
    self.create_schema = function () {
      console.log('Creating schema.')
      $scope.schema_fields = $sce.trustAsHtml(fields_html)
    }

    //
    // Add a field to the schema.
    //
    self.add_schema_field = function () {
      console.log('Adding field to schema.')
      $scope.schema_fields = $sce.trustAsHtml($scope.schema_fields += fields_html)
    }
  }])
