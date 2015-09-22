//
//
// Loading the authentication strategy
// and the user database model.
//
var User = require('../server/db/user')
var LocalStrategy = require('passport-local').Strategy

module.exports = function (passport) {
  //
  // Serialize and se-serialize user. This 
  // allows of login persistency.
  //
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })
  
  //
  // Login strategy.
  //
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, email, password, done) {
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
  // Sign-up strategy.
  //
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne({'local.email': email}, function (err, existingUser) {
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
            // Create a new user.
            //
          } else {
            var newUser = new User()

            newUser.local.email == email
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

    }))

}
