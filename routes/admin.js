var express  = require('express');
var router   = express.Router();
var Activity = require('../models/activity');

function loggedIn(req, res, next) {
  var user = req.user;
  if (user && (user.role === 'admin' || user.role === 'beta')) {
    next();
  } else {
    res.json( {result: 'ERROR: API call not authorized'} );
  }
}

function isAdmin(req, res, next) {
  var user = req.user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.redirect('/');
  }
}

router.get('/activities', isAdmin, function(req, res) {
  var results = req.query.results;
  var type = req.query.type;
  // TODO: implement pagination
  // var page = req.query.page;
  var maxResults = 0;
  var findParam = {};
  if (results) {
    maxResults = results;
  }
  Activity.find(findParam).sort({title: 'asc'}).limit(maxResults).exec(function (err, activities) {
    if (err) {
      return console.error(err);
    }
    res.render( 'activities', {
      user : req.user,
      activities : activities
    });
  });
});

router.get('/activity', isAdmin, function (req, res) {
  res.render( 'activity', {
    user : req.user,
    activity: {}
  });
});

router.get('/activity/edit/:id', isAdmin, function (req, res) {
  Activity.findById(req.params.id, function (err, activity) {
    res.render( 'activity', {
      user : req.user,
      activity : activity
    });
  });
});

module.exports = router;
