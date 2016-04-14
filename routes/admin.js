var express  = require('express');
var router   = express.Router();
var Account  = require('../models/account');
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

router.get('/signup', isAdmin, function(req, res) {
  res.render('register-page', {
    user: req.user,
    valid: true
  });
});

router.get('/users', isAdmin, function(req, res) {
  Account.find({}).sort({city: 1}).exec(function (err, accounts) {
    if (err) {
      console.error(err);
      return res.json( {result: 'Error: '+err} );
    }
    var filteredAccounts = accounts.map(function(account) {
      var filterAccount = {
        email: account.email,
        username: account.username,
        city: account.city,
        region: account.region,
        country: account.country,
        yearborn: account.yearborn,
        role: account.role,
        votesCast: account.votesCast,
        votesReceived: account.votesReceived,
        lastFeeling: account.lastFeeling,
        lastSeverity: account.lastSeverity,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
      return filterAccount;
    });
    res.render( 'users', {
      user: req.user,
      accounts: filteredAccounts
    });
  });
});

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
