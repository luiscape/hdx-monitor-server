module.exports = function(app, passport) {

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('index.ejs')
  })

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user
    })
  })

  // LOGOUT ==============================
  app.get('/logout', isLoggedIn, function(req, res) {
    req.logout()
    res.redirect('/')
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', isLoggedOut, function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') })
  })

  app.get('/dashboard', isLoggedOut, function(req, res) {
    res.render('dashboard.ejs')
  })

  app.get('/datastore', isLoggedOut, function(req, res) {
    res.render('datastore.ejs')
  })

  // process the login form
  app.post('/login', isLoggedOut, passport.authenticate('local-login', {
    successRedirect : '/dashboard', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }))

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', isLoggedOut, function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') })
  })

  // process the signup form
  app.post('/signup', isLoggedOut, passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }))

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally --------------------------------
  app.get('/connect/local', isLoggedIn, function(req, res) {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') })
  })

  app.post('/connect/local', isLoggedIn, 
   passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
   })
  )

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

  res.redirect('/')
}
