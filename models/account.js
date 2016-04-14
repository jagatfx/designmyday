var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  username: { type: String, lowercase: true, trim: true, required: true, unique: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  city: { type: String, trim: true },
  region: { type: String, trim: true },
  country: { type: String, trim: true },
  yearborn: { type: Number, default: -1 },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, default: 'beta' },
  votesCast: { type: Number, default: 0 },
  votesReceived: { type: Number, default: 0 },
  lastFeeling: { type: String, default: 'fine', lowercase: true, trim: true },
  lastSeverity: { type: Number, default: 5 },
  lastChosenActivity: { type: String, default: '' },
  favorites: [String],
  completes: [String],
  _voteUser: { type: Schema.Types.ObjectId, ref: 'Account' },
  voteCastSequence: [Schema.Types.Mixed],
  voteReceiveSequence: [Schema.Types.Mixed],
  activitySelectSequence: [Schema.Types.Mixed],
  historicFeelings: [Schema.Types.Mixed],
  historicSeverity: [Schema.Types.Mixed],
  feedbackReports: [Schema.Types.Mixed]
}, {
  timestamps: true
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
