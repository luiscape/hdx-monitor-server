// config/database.js
module.exports = {
  'url': 'mongodb://' +
    process.env.MONGODB_USER_NAME + ':' +
    process.env.MONGODB_USER_PASSWORD + '@' +
    process.env.MONGO_PORT_27017_TCP_ADDR + ':27017/' +
    process.env.MONGODB_DATABASE
}
