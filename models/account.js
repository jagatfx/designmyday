var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  email: { type: String, lowercase: true, trim: true },
  username: { type: String, lowercase: true, trim: true },
  password: String,
  city: { type: String, lowercase: true, trim: true },
  country: { type: String, lowercase: true, trim: true },
  yearborn: { type: Number, default: -1 },
  isAdmin: { type: Boolean, default: false },
  votesCast: { type: Number, default: 0 },
  votesReceived: { type: Number, default: 0 },
  lastFeeling: { type: String, default: 'fine', lowercase: true, trim: true },
  lastSeverity: { type: Number, default: 5 },
  lastChosenActivity: { type: String, default: '' },
  _voteUser: { type: Schema.Types.ObjectId, ref: 'Account' }
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
