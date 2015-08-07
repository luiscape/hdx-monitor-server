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
  if (alertType && alertMessage) {
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
    if (alertType === 1 | alertType === 2) {
      var pulse = '<div class="outer"></div>'
      var pulseDoc = document.getElementById('alert-container')
      pulseDoc.innerHTML = pulse
    }
  } else {
    var alertContainer = '<span class="fa fa-warning"></span>' +
      '<span ' + 'style="color:' + 'grey' + '">' +
      'unavailable' + '</span>'
  }

  var doc = document.getElementById('status-alert')
  doc.innerHTML = alertContainer
}

angular.module('Monitor', []).controller('StatusAlertController', ['$http', function ($http) {
  var self = this
  var service_port = 5000  // datastore
  var service_url = 'http://localhost:' + service_port + '/status'
  self.check = function () {
    $http.get(service_url)
      .then(
        function (response) {
          displayAlert('0', '  ONLINE')
        },
        function (response) {
          displayAlert('2', '  OFFLINE')
        }
    )
  }
}])
