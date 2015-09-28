//
// Loading the authentication strategy
// and the user database model.
//
var User = require('../server/db/user')
var LocalStrategy = require('passport-local').Strategy

module.exports = function (passport) {
  //
  // Serialize users.
  //
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  //
  // Deserialize users.
  //
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })

  //
  // Login with local strategy.
  //
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne({ 'local.email': email }, function (err, user) {
          if (err) {
            return done(err)
          }

          //
          // If no user is found, return the message.
          //
          if (!user) {
            return done(null, false, req.flash('loginMessage', 'No user found.'))
          }

          if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Wrong password.'))

          //
          // If no errors, return user.
          //
          } else {
            return done(null, user)
          }
        })
      })

    }))

  //
  // Local signup.
  //
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne({ 'local.email': email }, function (err, existingUser) {
          if (err) {
            return done(err)
          }

          //
          // Check if the email has been already taken.
          //
          if (existingUser) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'))
          }

          if (req.user) {
            var user = req.user
            user.local.email = email
            user.local.password = user.generateHash(password)
            user.save(function (err) {
              if (err) {
                throw err
              }
              return done(null, user)
            })

          //
          // Create new user if not signed in.
          //
          } else {
            var newUser = new User()

            newUser.local.email = email
            newUser.local.password = newUser.generateHash(password)

            newUser.save(function (err) {
              if (err) {
                throw err
              }
              return done(null, newUser)
            })
          }

        })
      })

    })
  )

}
