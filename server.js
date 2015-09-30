var morgan = require('morgan')
var express = require('express')
var mongoose = require('mongoose')
var passport = require('passport')
var flash = require('connect-flash')
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser')

//
// Change configuration files here.
//
var config = require('./config/dev.js')
var configDB = require('./config/database.js')

//
// Create Express application.
//
var app = express()

//
// Application configuration.
//
app.use(morgan('dev'))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser('hdxmonitor'))
app.set('views', __dirname + '/views')
app.use(bodyParser.urlencoded({ extended: false }))

//
// Load passport.
//
require('./config/passport')(passport)
app.use(session({
  secret: process.env.SESSION_KEY || 'hdxmonitor',
  saveUninitialized: false,
  resave: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//
// Load routes.
//
require('./app/routes.js')(app, passport, config)

//
// Connect to database and start application.
//
mongoose.connect(configDB.url)
app.listen(config.port)
console.log('HDX Monitor Server (' + config.version + ') running on port ' + config.port)
