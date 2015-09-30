module.exports = function (app, passport, config) {
  var http = require('http')
  var services = require('../config/services')
  var querystring = require('querystring')
  var forEachAsync = require('forEachAsync').forEachAsync

  //
  // Memory object for services.
  //
  var services = config.services
  var serviceInfo = {
    'id': '',
    'method': ''
  }

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
  // app.get('/api/:api_service/status', function (req, res) {
  //   var services = {
  //     'datastore': 'http://' + process.env.DATASTORE_PORT_5000_TCP_ADDR + ':' + process.env.DATASTORE_PORT_5000_TCP_PORT + '/status',
  //     'funnel_stats': 'http://' + process.env.FUNNEL_STATS_PORT_7000_TCP_ADDR + ':' + process.env.FUNNEL_STATS_PORT_7000_TCP_PORT + '/status',
  //     'dataset_age': 'http://' + process.env.AGE_PORT_7000_TCP_ADDR + ':' + process.env.AGE_PORT_3000_TCP_PORT + '/v1/status/'
  //   }
  //   http.get(services[serviceInfo.id], function (response) {
  //     var body = ''
  //     response.on('data', function (chunk) {
  //       body += chunk
  //     })
  //     response.on('close', function () {
  //       res.send(body)
  //     })
  //     response.on('end', function () {
  //       // console.log(body)
  //       res.send(body)
  //     })
  //   }).on('error', function (error) {
  //     var payload = require('../public/service_data/' + serviceInfo.id + '_offline.json')
  //     res.send(payload)
  //   })
  // })

  //
  // Internal function to generate
  // an options object for HTTP
  // requests.
  //
  var _options = function (service) {
    var keepAliveAgent = new http.Agent({ keepAlive: true })
    var options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      host: services[service].host,
      port: services[service].port,
      path: null,  // filled later by route.
      method: null,  // filled later by route.
      agent: keepAliveAgent
    }
    return options
  }

  //
  // Get the status of all services.
  //
  app.get('/api', function (req, res) {
    var payload = {
      'success': true,
      'message': 'HDX Monitor collection of APIs backed by services.',
      'version': config.version,
      'services': {}
    }
    //
    // Queries the status
    // of each registered service.
    //
    var services = config.services
    var keys = Object.keys(services)
    forEachAsync(keys, function (next, key) {
      //
      // Get options and make
      // requests to each of their
      // status.
      //
      var options = _options(key)
      options.path = '/status'
      options.method = 'GET'

      //
      // Make request for each
      // available service.
      //
      var request = http.request(options, function (response) {
        response.setEncoding('utf8')
        var body = ''
        response.on('data', function (chunk) {
          body += chunk
        })
        response.on('close', function () {
          payload.services[key] = JSON.parse(body)
          next()
        })
        response.on('end', function () {
          payload.services[key] = JSON.parse(body)
          next()
        })
      })

      //
      // If request fails,
      // set response object to null.
      //
      request.on('error', function (error) {
        var out = {
          'success': false,
          'message': 'Service not available.',
          'error': error
        }
        payload.services[key] = out
        next()
      })

      //
      // Closing request.
      //
      request.end()

    }).then(function () {
      res.send(payload)
    })
  })

  // app.all('/api/:api_service*', function (req, res) {
  //   //
  //   // Services available.
  //   //
  //   var services = config.services

  //   //
  //   // Getting a query service base url
  //   // but also pass extra parameters.
  //   //
  //   // var query_service = services[serviceInfo.id].host
  //   var pass_request = req.originalUrl.replace('/api/' + serviceInfo.id, '')
  //   var options = _options(serviceInfo.id)

  //   //
  //   // Make request to service using
  //   // the options that came via the UI.
  //   //
  //   console.log(options)
  //   var request = http.request(options, function (response) {
  //     response.setEncoding('utf8')
  //     var body = ''
  //     response.on('data', function (chunk) {
  //       body += chunk
  //     })
  //     response.on('close', function () {
  //       res.send(body)
  //     })
  //     response.on('end', function () {
  //       res.send(body)
  //     })
  //   })

  //   //
  //   // If the request to a service
  //   // fails, query that service status
  //   // and inform that user that the
  //   // service is not available.
  //   //
  //   request.on('error', function (error) {
  //     var payload = {
  //       'success': false,
  //       'message': 'Service not available.',
  //       'service': serviceInfo.id
  //     }
  //     res.send(payload)
  //   })

  //   request.write(querystring.stringify(req.body))
  //   request.end()
  // })

  //
  // UI ROUTES ==================================
  //

  //
  // Pages.
  //
  app.get('/', isLoggedOut, function (req, res) {
    res.render('index.ejs')
  })

  app.get('/profile', function (req, res) {
    res.render('profile.ejs', {
      user: req.user
    })
  })

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

  // app.get('/settings', isLoggedIn, function (req, res) {
  //   res.render('settings.ejs')
  // })

  //
  // Login.
  //
  app.get('/login', isLoggedOut, function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') })
  })

  app.post('/login', isLoggedOut, passport.authenticate('local-login', {
    successRedirect: '/datastore',
    failureRedirect: '/login',
    failureFlash: true
  }))

  //
  // Signup.
  //
  app.get('/signup', isLoggedOut, function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') })
  })

  app.post('/signup', isLoggedOut, passport.authenticate('local-signup', {
    successRedirect: '/datastore',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  //
  // Any other routes redirect
  // to landing page.
  //
  // TODO: Create 404 page.
  //
  app.use(function (req, res, next) {
    res.status(404).redirect('/')
  })

}

//
// Middleware to ensure user is
// logged in.
//
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

//
// Middleware to ensure user is
// logged out.
//
function isLoggedOut (req, res, next) {
  if (req.isUnauthenticated()) {
    return next()
  }

  res.redirect('/dashboard')
}
