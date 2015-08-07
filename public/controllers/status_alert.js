// script to manage the alert system
// at the top of the page of the Ebola API

// function for checking if string is null, empty, or undefined
// from: http://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript
function isEmpty (str) {
  return (!str || 0 === str.length)
}

// function to display system alerts
function displayAlert (alertType, alertMessage) {
  // defining the two variables used
  var alertMessage, alertType

  // control for alert type to html
  // 0 = simple (green)
  // 1 = mild (yellow)
  // 2 = severe (red)
  if (alertType && alertMessage) {
    colors = ['#cccccc', '#404040', '#404040']
    alertColor = colors[alertType]
    if (alertType == 0) {
      alertIcon = '<span style="color:#cccccc;" class="fa fa-check"></span>'
    } else {
      alertIcon = '<span style="color:#cccccc;" class="fa fa-warning"></span>'
    }
    alertContainer = alertIcon + '<span ' + 'style="color:' + alertColor + ';">' +
      '<span href="#">' + alertMessage + '</span>' + '</span>'

    // pulse only for the mild and severe alerts
    if (alertType == 1 | alertType == 2) {
      pulse = '<div class="outer"></div>'
      var pulseDoc = document.getElementById('alert-container')
      pulseDoc.innerHTML = pulse
    }
  } else {
    alertContainer = '<span class="fa fa-warning"></span>' +
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
