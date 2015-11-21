var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  email: String,
  username: String,
  password: String,
  age: String,
  location: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
