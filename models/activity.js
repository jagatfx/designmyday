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
  targetIntensity: { type: Number, default: -1 },
  targetFeelings: String,
  restrictions: String
});

module.exports = mongoose.model('Activity', Activity);
