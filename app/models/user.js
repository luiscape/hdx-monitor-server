var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

//
// Define schema of user.
//
var userSchema = mongoose.Schema({
  local: {
    name: String,
    email: String,
    password: String,
    apikey: String
  }

})

//
// Generate hash of password.
//
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

//
// Check if the password is valid.
// In this case, we are not performing
// any proper checks.
//
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password)
}

module.exports = mongoose.model('User', userSchema)
