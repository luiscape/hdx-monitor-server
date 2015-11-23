module.exports = function (app, passport, config) {
  var http = require('http')
  var request = require('request')
  var querystring = require('querystring')
  var services = require('../config/services')
  var forEachAsync = require('forEachAsync').forEachAsync

  //
  // Memory object for services.
  //
  var services = config.services
  var serviceInfo = {
    'id': ''
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
  // Internal function to generate
  // an options object for HTTP
  // requests.
  //
  var _options = function (service, request_data) {
    var keepAliveAgent = new http.Agent({ keepAlive: true })
    var options = {
      headers: {
        'Content-Type': 'application/json'
      },
      host: services[service].host,
      port: services[service].port,
      url: 'http://' + services[service].host + ':' + services[service].port,
      path: null,  // filled later by route.
      method: null,  // filled later by route.
      agent: keepAliveAgent,
      json: request_data.body || null
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
      var options = _options(key, req)
      if (services[key].base) {
        options.path = '/' + services[key].base + '/status/'
      } else {
        options.path = '/status/'
      }
      options.method = 'GET'

      //
      // Make request for each
      // available service.
      //
      var instance = http.request(options, function (response) {
        response.setEncoding('utf8')
        var body = ''
        response.on('data', function (chunk) {
          body += chunk
        })
        response.on('close', function () {
          payload.services[key] = JSON.parse(body)
          payload.services[key].self = 'http://' + req.hostname + '/api/' + key
          next()
        })
        response.on('end', function () {
          payload.services[key] = JSON.parse(body)
          payload.services[key].self = 'http://' + req.hostname + '/api/' + key
          next()
        })
      })

      //
      // If request fails,
      // set response object to null.
      //
      instance.on('error', function (error) {
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
      instance.end()

    }).then(function () {
      res.send(payload)
    })
  })

  app.all('/api/:api_service*', function (req, res) {
    //
    // Services available.
    //
    var services = config.services

    //
    // Getting a query service base url
    // but also pass extra parameters.
    //
    var parameters = ''

    //
    // TODO: This test isn't working.
    //
    if (typeof req.body === typeof Object) {
      parameters = '?' + querystring.stringify(req.body)
    }
    var pass = req.originalUrl.replace('/api/' + serviceInfo.id, '')
    var options = _options(serviceInfo.id, req)

    //
    // Make request to service using
    // the options that came via the UI.
    //
    if (services[serviceInfo.id].base) {
      options.url += '/' + services[serviceInfo.id].base + pass + parameters
    } else {
      options.url += pass + parameters
    }
    options.method = req.method

    console.log('Making request to service: ' + serviceInfo.id)
    console.log(options)
    request(options, function (error, response, body) {
      if (error) {
        var payload = {
          'success': false,
          'message': 'Querying service failed.',
          'service': serviceInfo.id,
          'error': error,
          'details': body
        }
        res.send(payload)
      }
    }).on('response', function (response) {
      response.setEncoding('utf8')
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
    })
  })

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

  app.get('/dashboard', function (req, res) {
    res.render('dashboard.ejs')
  })

  // app.get('/users', isLoggedIn, function (req, res) {
  //   res.render('users.ejs')
  // })

  app.get('/organizations', isLoggedIn, function (req, res) {
    res.render('organizations.ejs')
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
    successRedirect: '/dashboard',
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
  app.use(function (req, res, next) {
    res.status(404)
    res.render('404.ejs')
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
