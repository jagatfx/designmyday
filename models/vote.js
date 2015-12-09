var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Vote = new Schema({
  voterId: String,
  voteeId: String,
  activityId: String
});

module.exports = mongoose.model('Vote', Vote);
