var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Activity = new Schema({
  metaActivity: { type: String, default: '' },
  activityVerb: { type: String, required: true },
  activity: { type: String, required: true },
  specificLocation: { type: String, required: true },
  needPass: { type: Boolean, default: false },
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  img: { type: String, default: '/img/activity-group.gif' },
  targetIntensity: { type: Number, default: 5 },
  targetFeelings: { type: String, default: '' },
  restrictions: { type: String, default: '' },
  activated: { type: Boolean, default: false },
  numVotes: { type: Number, default: 0 },
  ageu18Votes: { type: Number, default: 0 },
  age1824Votes: { type: Number, default: 0 },
  age2534Votes: { type: Number, default: 0 },
  age3544Votes: { type: Number, default: 0 },
  age4554Votes: { type: Number, default: 0 },
  age5564Votes: { type: Number, default: 0 },
  ageo65Votes: { type: Number, default: 0 },
  feelingWorriedVotes: { type: Number, default: 0 },
  feelingEmotionalVotes: { type: Number, default: 0 },
  feelingUnfocusedVotes: { type: Number, default: 0 },
  feelingBoredVotes: { type: Number, default: 0 },
  feelingStressedVotes: { type: Number, default: 0 },
  feelingLethargicVotes: { type: Number, default: 0 },
  feelingAngryVotes: { type: Number, default: 0 },
  feelingIsolatedVotes: { type: Number, default: 0 },
  feelingFineVotes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Activity', Activity);
