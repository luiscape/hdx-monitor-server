//
// Displays the status of a
// service on the service's
// respective page.
//
function displayAlert (alertType, alertMessage) {
  //
  // Control for alert type to html
  // 0 = simple (green)
  // 1 = mild (yellow)
  // 2 = severe (red)
  //
  if (typeof alertMessage === 'undefined') {
    var alertContainer = '<span style="color:#cccccc;" class="fa fa-warning"></span>' +
      '<span ' + 'style="color:#cccccc;">' +
      'UNKNOWN' + '</span>'
  } else {
    var alertIcon = null
    var colors = ['#cccccc', '#404040', '#404040']
    var alertColor = colors[alertType]
    if (alertType === 0) {
      alertIcon = '<span style="color:#cccccc;" class="fa fa-check"></span>'
    } else {
      alertIcon = '<span style="color:#cccccc;" class="fa fa-warning"></span>'
    }
    alertContainer = alertIcon + '<span ' + 'style="color:' + alertColor + ';">' +
      '<span href="#">' + alertMessage + '</span>' + '</span>'

    // pulse only for the mild and severe alerts
    if (alertType === 1 || alertType === 2) {
      var pulse = '<div class="outer"></div>'
      var pulseDoc = document.getElementById('alert-container')
      pulseDoc.innerHTML = pulse
    }
  }

  var doc = document.getElementById('status-alert')
  doc.innerHTML = alertContainer
}

//
// Controlllers for the DataStore.
//
angular.module('Monitor', [])
  .controller('StatusAlertController', ['$http', function ($http) {
    self.check = function () {
      var service_url = '/api/datastore'
      $http.get(service_url + '/status')
        .then(
          function (response) {
            displayAlert(0, '  ONLINE')
          },
          function (response) {
            displayAlert(2, '  OFFLINE')
          }
      )
    }
  }])
  .controller('DataStoreController', ['$http', function ($http) {
    self.submit = function () {
      $http.get('/api/datastore')
        .then(
          function (response) {
            displayAlert(0, '  ONLINE')
          },
          function (response) {
            displayAlert(2, '  OFFLINE')
          }
      )
    }
  }])
