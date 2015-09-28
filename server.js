var express = require('express')
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
// Change configuration file here.
//
var config = require('./config/dev.js')

//
// App variables.
//
var app = express()

mongoose.connect(configDB.url)

require('./config/passport')(passport)  // Pass passport for configuration.
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser())
app.use(express.static('public'))

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

//
// Required for passport.
//
app.use(session({ secret: process.env.SESSION_PASSWORD || 'devpassword' }))
app.use(passport.initialize())
app.use(passport.session())  // Persistent login sessions.
app.use(flash())

require('./server/routes.js')(app, passport)

app.listen(config.port)
console.log('HDX Monitor Server (' + config.version + ') running on port ' + config.port)
