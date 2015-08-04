// config/database.js
module.exports = {
  'url': 'mongodb://' + 
          process.env.MONGODB_USER_NAME + ':' +
          process.env.MONGODB_USER_PASSWORD + '@' +
          process.env.MONGODB_LOCATION_URL + '/' +
          process.env.MONGODB_DATABASE
}
