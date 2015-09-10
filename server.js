//
// Setup ======================================================================
//

var express = require('express')
var app = express()
var mongoose = require('mongoose')
var passport = require('passport')
var flash = require('connect-flash')
var methodOverride = require('method-override')

var morgan = require('morgan')
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')

var configDB = require('./config/database.js')

//
// App variables.
//
var _version = 'v.0.1.5'
var port = process.env.PORT || 8080

//
// Configuration ===============================================================
//
mongoose.connect(configDB.url)

require('./config/passport')(passport)  // Pass passport for configuration.
app.use(morgan('dev'))  // Log every request to the console.
app.use(cookieParser())  // Read cookies (needed for auth).
app.use(bodyParser())  // Get information from html forms.
app.use(express.static('public'))  // Serving static files.

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

//
// Required for passport.
//
app.use(session({ secret: process.env.SESSION_PASSWORD || 'devpassword' }))
app.use(passport.initialize())
app.use(passport.session())  // Persistent login sessions.
app.use(flash())

//
// Routes ======================================================================
//
require('./server/routes.js')(app, passport) // load our routes and pass in our app and fully configured passport

//
// launch ======================================================================
//
app.listen(port)
console.log('HDX Monitor Server (' + _version + ') running on port ' + port)
