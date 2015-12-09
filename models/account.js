var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  email: String,
  username: String,
  password: String,
  city: String,
  country: String,
  yearborn: { type: Number, default: -1 },
  isAdmin: { type: Boolean, default: false }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
