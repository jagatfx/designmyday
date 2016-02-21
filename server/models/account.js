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
  role: { type: String, default: 'user' },
  votesCast: { type: Number, default: 0 },
  votesReceived: { type: Number, default: 0 },
  lastFeeling: { type: String, default: 'fine', lowercase: true, trim: true },
  lastSeverity: { type: Number, default: 5 },
  lastChosenActivity: { type: String, default: '' },
  _voteUser: { type: Schema.Types.ObjectId, ref: 'Account' },
  voteCastSequence: [Schema.Types.Mixed],
  voteReceiveSequence: [Schema.Types.Mixed],
  activitySelectSequence: [Schema.Types.Mixed]
});

// TODO: track individual votes (date, activity, who voted for, what their feeling was, what their severity was)

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
