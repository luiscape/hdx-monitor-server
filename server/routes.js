module.exports = function (app, passport) {
  var http = require('http')

  // show the home page (will also have our login links)
  app.get('/', isLoggedOut, function (req, res) {
    res.render('index.ejs')
  })

  app.get('/api', isLoggedIn, function (req, res) {
    var payload = { 'datastore': '/api/datastore/status' }
    res.send(payload)
  })

  //
  // TODO: Needs refactoring.
  //
  app.get('/api/datastore/status', function (req, res) {
    var datastore = 'http://localhost:' + process.env.DATASTORE_PORT + '/status'
    http.get(datastore, function (response) {
      response.on('data', function (data) {
        res.send(JSON.parse(data))
      })
      response.on('error', function (error) {
        console.log(error)
      })
    })
  })

  app.post('/api/datastore', function (req, res) {
    var datastore = 'http://localhost:' + process.env.DATASTORE_PORT + '/' + req.body.resourceid
    http.get(datastore, function (response) {
      response.on('data', function (data) {
        res.send(JSON.parse(data))
      })
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
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  //
  // Any other routes redirect
  // to /datastore.
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
