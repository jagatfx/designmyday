var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Activity = new Schema({
  metaActivity: String,
  activityVerb: String,
  activity: String,
  specificLocation: String,
  needPass: Boolean,
  city: String,
  country: String,
  description: String,
  link: String,
  img: String,
  targetIntensity: { type: Number, default: 5 },
  targetFeelings: String,
  restrictions: String,
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
