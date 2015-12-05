var needle = require('needle');

var activities = require('./data/input.json');

var apiUrl = 'http://localhost:3000/api/activity';

for(var i = 0; i < activities.length; i++) {
  needle.post(apiUrl, activities[i], function(err, resp, body) {
    console.log(body);
    return;
  });
}
