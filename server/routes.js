module.exports = function (app, passport) {
  var http = require('http')
  var forEachAsync = require('forEachAsync').forEachAsync

  //
  // Place holder dataset.
  //
  var serviceInfo = {
    'id': '',
    'method': '',
    'parameter': ''
  }

  app.get('/', isLoggedOut, function (req, res) {
    res.render('index.ejs')
  })

  //
  // Collect resource id from parameter.
  // And route to appropriate service.
  //
  app.param('api_service', function (req, res, next, value) {
    serviceInfo.id = value
    next()
  })

  app.param('service_method', function (req, res, next, value) {
    serviceInfo.method = value
    next()
  })

  //
  // TODO: abstract this route.
  //
  app.get('/api/:api_service/status', function (req, res) {
    var services = {
      'datastore': 'http://' + process.env.DATASTORE_PORT_5000_TCP_ADDR + ':' + process.env.DATASTORE_PORT_5000_TCP_PORT + '/status',
      'funnel_stats': 'http://' + process.env.FUNNEL_STATS_PORT_7000_TCP_ADDR + ':' + process.env.FUNNEL_STATS_PORT_7000_TCP_PORT + '/status',
      'dataset_age': 'http://' + process.env.AGE_PORT_7000_TCP_ADDR + ':' + process.env.AGE_PORT_3000_TCP_PORT + '/v1/status/'
    }
    http.get(services[serviceInfo.id], function (response) {
      var body = ''
      response.on('data', function (chunk) {
        body += chunk
      })
      response.on('close', function () {
        res.send(body)
      })
      response.on('end', function () {
        // console.log(body)
        res.send(body)
      })
    }).on('error', function (error) {
      var payload = require('../public/service_data/' + serviceInfo.id + '_offline.json')
      res.send(payload)
    })
  })

  app.get('/api/:api_service/:service_method*', function (req, res) {
    //
    // Services available.
    //
    var services = {
      'datastore': { 'base_url': 'http://' + process.env.DATASTORE_PORT_5000_TCP_ADDR + ':' + process.env.DATASTORE_PORT_5000_TCP_PORT },
      'funnel_stats': { 'base_url': 'http://' + process.env.FUNNEL_STATS_PORT_7000_TCP_ADDR + ':' + process.env.FUNNEL_STATS_PORT_7000_TCP_PORT + '/api' },
      'dataset_age': { 'base_url': 'http://' + process.env.AGE_PORT_3000_TCP_ADDR + ':' + process.env.AGE_PORT_3000_TCP_PORT + '/v1' }
    }

    //
    // Getting a query service base url
    // but also pass extra parameters.
    //
    var query_service = services[serviceInfo.id].base_url + '/' + serviceInfo.method
    var pass_request = req.originalUrl.replace('/api/' + serviceInfo.id + '/' + serviceInfo.method, '')

    http.get(query_service + pass_request, function (response) {
      var body = ''
      response.on('data', function (chunk) {
        body += chunk
      })
      response.on('close', function () {
        res.send(body)
      })
      response.on('end', function () {
        res.send(body)
      })
    }).on('error', function (error) {
      http.get('http://' + req.get('host') + '/api/' + serviceInfo.id + '/status', function (resp) {
        resp.on('data', function (data) {
          res.send({ 'sucess': false, 'message': 'Service is not available.', 'service': serviceInfo.id, 'service_status': JSON.parse(data) })
        }).on('error', function (data) {
          res.send({ 'sucess': false, 'message': 'Service is not available.', 'service': serviceInfo.id })
        })
      })
    })
  })

  //
  // Get the status of all services.
  //
  // TODO: apstract the status fetching.
  //
  app.get('/api', function (req, res) {
    var payload = {
      'datastore': { 'status_url': 'http://' + req.get('host') + '/api/datastore/status' },
      'funnel_stats': { 'status_url': 'http://' + req.get('host') + '/api/funnel_stats/status' },
      'dataset_age': { 'status_url': 'http://' + req.get('host') + '/api/dataset_age/status' }
    }
    forEachAsync(Object.keys(payload), function (next, service_key) {
      http.get(payload[service_key].status_url, function (response) {
        var body = ''
        response.on('data', function (data) {
          payload[service_key].status = JSON.parse(data)
          next()
        })
      }).on('error', function (error) {
        payload[service_key].status = null
        console.log(error)
        next()
      })
    }).then(function () {
      res.send(payload)
    })
  })

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
      user: req.user
    })
  })

  // LOGOUT ==============================
  app.get('/logout', isLoggedIn, function (req, res) {
    req.logout()
    res.redirect('/')
  })

  app.get('/dashboard', function (req, res) {
    res.render('dashboard.ejs')
  })

  app.get('/datastore', function (req, res) {
    res.render('datastore.ejs')
  })

  // app.get('/settings', isLoggedIn, function (req, res) {
  //   res.render('settings.ejs')
  // })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', isLoggedOut, function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') })
  })

  // process the login form
  app.post('/login', isLoggedOut, passport.authenticate('local-login', {
    successRedirect: '/datastore', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', isLoggedOut, function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') })
  })

  // process the signup form
  app.post('/signup', isLoggedOut, passport.authenticate('local-signup', {
    successRedirect: '/datastore', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  //
  // Any other routes redirect
  // to landing page.
  //
  app.use(function (req, res, next) {
    res.status(404).redirect('/')
  })

}

// route middleware to ensure user is logged in
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// route middleware to ensure user is logged out
function isLoggedOut (req, res, next) {
  if (req.isUnauthenticated()) {
    return next()
  }

  res.redirect('/dashboard')
}
