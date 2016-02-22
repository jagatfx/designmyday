var express       = require('express');
var router        = express.Router();
var passport      = require('passport');
var async         = require('async');
var crypto        = require('crypto');
var nodemailer    = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

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
    return res.redirect('/dmd');
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

router.get('/dmd', loggedIn, function(req, res, next) {
  next();
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
      console.log('/login no user redirect');
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
          return res.redirect('/dmd/#/vote');
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

router.post('/forgot', function(req, res, next) {
  console.log('got /forgot POST with email:'+req.body.email);
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      Account.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with email address '+req.body.email+' exists.');
          return res.redirect('/');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var options = {
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
      };
      var transporter = nodemailer.createTransport(smtpTransport(options));
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@designmyday.co',
        subject: 'Design My Day - Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err, response) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
      console.error('/forgot error: '+err);
      return next(err);
    }
    res.redirect('/');
  });
});

router.get('/reset/:token', function(req, res) {
  Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        user.setPassword(req.body.password, function(err, user, passwordErr) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) {
              console.error('/reset save error:'+err);
            }
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      });
    },
    function(user, done) {
      var options = {
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
      };
      var transporter = nodemailer.createTransport(smtpTransport(options));
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@designmyday.co',
        subject: 'Design My Day - Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account with email ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err, response) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      console.error('/reset error:'+err);
    }
    res.redirect('/');
  });
});

/////////////////

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

// TODO: think about keeping track of who voted for today and exclude those users as well
function getMostUnvotedUser (excludeUser, callback) {
  Account.count({city: excludeUser.city, username: { '$ne': excludeUser.username }})
  .exec(function(err, count) {
    if (count === 0) {
      return callback("ERROR: no users from the voter's city");
    }

    Account.findOne({city: excludeUser.city, username: { '$ne': excludeUser.username }})
    .sort({votesReceived: 'asc'})
    .exec(function (err, selectedAccount) {
      callback(null, selectedAccount);
    });
  });
}

module.exports = router;
