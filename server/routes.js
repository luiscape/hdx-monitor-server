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

  app.param('method_parameter', function (req, res, next, value) {
    serviceInfo.parameter = value
    next()
  })

  //
  // TODO: refactor to allow for generic route above.
  //
  app.get('/api/datastore/status', function (req, res) {
    var datastore = 'http://' + process.env.DATASTORE_PORT_5000_TCP_ADDR + ':' + process.env.DATASTORE_PORT_5000_TCP_PORT + '/status'
    http.get(datastore, function (response) {
      response.on('data', function (data) {
        res.send(JSON.parse(data))
      })
    }).on('error', function (error) {
      var payload = require('../public/service_data/datastore_offline.json')
      res.send(payload)
    })
  })

  app.get('/api/funnel_stats/status', function (req, res) {
    var datastore = 'http://' + process.env.FUNNEL_STATS_PORT_7000_TCP_ADDR + ':' + process.env.FUNNEL_STATS_PORT_7000_TCP_PORT + '/status'
    http.get(datastore, function (response) {
      response.on('data', function (data) {
        if (data.length > 0) {
          res.send(JSON.parse(data))
        } else {
          var payload = require('../public/service_data/funnel_stats_offline.json')
          res.send(payload)
        }
      })
    }).on('error', function (error) {
      var payload = require('../public/service_data/funnel_stats_offline.json')
      res.send(payload)
    })
  })

  app.get('/api/:api_service/:service_method/:method_parameter', function (req, res) {
    var services = {
      'datastore': { 'base_url': 'http://' + process.env.DATASTORE_PORT_5000_TCP_ADDR + ':' + process.env.DATASTORE_PORT_5000_TCP_PORT + '/' },
      'funnel_stats': { 'base_url': 'http://' + process.env.FUNNEL_STATS_PORT_7000_TCP_ADDR + ':' + process.env.FUNNEL_STATS_PORT_7000_TCP_PORT + '/' }
    }

    var query_service = services[serviceInfo.id].base_url + serviceInfo.method + '/' + serviceInfo.parameter
    http.get(query_service, function (response) {
      response.on('data', function (data) {
        res.send(JSON.parse(data))
      })
    }).on('error', function (error) {
      res.send({ 'sucess': false, 'message': 'Method not found.', 'service': serviceInfo.method })
    })
  })

  app.get('/api', function (req, res) {
    var payload = {
      'datastore': { 'status_url': req.protocol + '://' + req.get('host') + '/api/datastore/status' },
      'funnel_stats': { 'status_url': req.protocol + '://' + req.get('host') + '/api/funnel_stats/status' }
    }

    forEachAsync(Object.keys(payload), function (next, service_key) {
      http.get(payload[service_key].status_url, function (response) {
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

  app.get('/dashboard', isLoggedIn, function (req, res) {
    res.render('dashboard.ejs')
  })

  app.get('/datastore', isLoggedIn, function (req, res) {
    res.render('datastore.ejs')
  })

  app.get('/settings', function (req, res) {
    res.render('settings.ejs')
  })

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
    successRedirect: '/dashboard', // redirect to the secure profile section
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
    successRedirect: '/dashboard', // redirect to the secure profile section
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
