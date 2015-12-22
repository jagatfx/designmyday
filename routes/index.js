var express  = require('express');
var router   = express.Router();
var passport = require('passport');

var Account  = require('../models/account');

function loggedIn(req, res, next) {
  // TODO: admin to beta level when ready
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
}

router.get('/', function (req, res) {
  if (req.user && req.user.isAdmin) {
    return res.redirect('/vote');
  }
  res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.get('/team', function(req, res) {
  res.render('team', { });
});

router.get('/news', function(req, res) {
  res.render('news', { });
});

router.get('/profile', function(req, res) {
  res.render('profile', { user : req.user });
});

router.post('/register', function(req, res) {
  console.log('got /register POST');
  Account.register(new Account({
    username : req.body.username,
    email: req.body.email,
    city: req.body.city,
    country: req.body.country,
    yearborn: req.body.yearborn
  }), req.body.password, function(err, account) {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }

    passport.authenticate('local')(req, res, function () {
      return res.redirect('/');
    });
  });
});

router.post('/login', function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    if (!user) {
      console.log('no user redirect');
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) {
        console.error(err);
        return res.redirect('/');
      }
      getMostUnvotedUser(user, function(err, selectedUser) {
        if (err) {
          console.error(err);
          return res.redirect('/');
        } else {
          user._voteUser = selectedUser._id;
          user.save( function ( err, user, count ) {
            if (err) {
              console.error(err);
            } else {
              console.log('saved user: '+user.username+' with voteUser:'+user._voteUser);
            }
          });
        }
        if (user.isAdmin) {
          return res.redirect('/vote');
        } else {
          return res.redirect('/');
        }
      });
    });
  })(req, res);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/vote', loggedIn, function(req, res) {
  var currentYear = new Date().getFullYear();
  Account.findOne({_id: req.user._id})
  .populate('_voteUser')
  .exec(function (err, account) {
    if (!account._voteUser) {
      console.error('/vote did not find _voteUser');
      // TODO: decide if need to do something for this case
    }
    res.render('vote', {
      user : account,
      voteeAge: (currentYear - account._voteUser.yearborn),
      voterAge: (currentYear - account.yearborn)
    });
  });
});

router.get('/addactivity', loggedIn, function(req, res) {
  res.render('addactivity', { user : req.user });
});

router.get('/feeling', loggedIn, function(req, res) {
  res.render('feeling', { user : req.user });
});

router.get('/severity', loggedIn, function(req, res) {
  res.render('severity', { user : req.user });
});

router.get('/myactivity', loggedIn, function(req, res) {
  res.render('myactivity', { user : req.user });
});

// TODO: move to more appropriate place
function getRandomUser (excludeUser, callback) {
  Account.count({city: excludeUser.city, username: { '$ne': excludeUser.username }})
  .exec(function(err, count) {
    if (count === 0) {
      return callback("ERROR: no users from the voter's city");
    }
    var random = Math.floor(Math.random() * count);

    Account.findOne({city: excludeUser.city, username: { '$ne': excludeUser.username }})
    .skip(random)
    .exec(function (err, selectedAccount) {
      callback(null, selectedAccount);
    });
  });
}

function getMostUnvotedUser (excludeUser, callback) {
  Account.count({city: excludeUser.city, username: { '$ne': excludeUser.username }})
  .exec(function(err, count) {
    if (count === 0) {
      return callback("ERROR: no users from the voter's city");
    }
    var random = Math.floor(Math.random() * count);

    Account.findOne({city: excludeUser.city, username: { '$ne': excludeUser.username }})
    .skip(random)
    .exec(function (err, selectedAccount) {
      callback(null, selectedAccount);
    });
  });
}

module.exports = router;
