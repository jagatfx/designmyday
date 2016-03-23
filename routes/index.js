var express       = require('express');
var router        = express.Router();
var passport      = require('passport');
var async         = require('async');
var crypto        = require('crypto');
var nodemailer    = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var aws           = require('aws-sdk');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET      = process.env.S3_BUCKET;

var Account  = require('../models/account');

function loggedIn(req, res, next) {
  var user = req.user;
  if (user && (user.role === 'admin' || user.role === 'beta')) {
    next();
  } else {
    res.redirect('/');
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

router.get('/', function (req, res) {
  var user = req.user;
  if (user && (user.role === 'admin' || user.role === 'beta')) {
    return res.redirect('/dmd/#/vote');
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

router.get('/tos', function(req, res) {
  res.render('tos', { });
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { });
});

router.get('/dcma', function(req, res) {
  res.render('dcma', { });
});

router.get('/dmd', loggedIn, function(req, res, next) {
  next();
});

router.post('/register', function(req, res) {
  console.log('got /register POST');
  var citycountry = req.body.citycountry;
  var city;
  var region;
  var country;
  var regex = /([^,]+), ([^,]+), (.+)/;
  if (citycountry) {
    var fields = regex.exec(citycountry);
    if (fields.length === 4) {
      city = fields[1];
      region = fields[2];
      country = fields[3];
    } else {
      console.error('Invalid citycountry:'+citycountry);
      req.flash('error', 'You must pick a valid city/country');
      return res.redirect('/');
    }
  } else {
    console.error('citycountry field was empty');
    req.flash('error', 'You must pick a valid city/country');
    return res.redirect('/');
  }
  // TODO: validate register input
  Account.register(new Account({
    username : req.body.username,
    email: req.body.email,
    city: city,
    region: region,
    country: country,
    yearborn: req.body.yearborn
  }), req.body.password, function(err, account) {
    if (err) {
      console.error(err);
      req.flash('error', 'Problem registering account: '+err);
      return res.redirect('/');
    }

    passport.authenticate('local')(req, res, function () {
      return res.redirect('/');
    });
  });
});

function assignVoteeUser(req, res) {
  var user = req.user;
  getMostUnvotedUser(user, function(err, selectedUser) {
    if (err) {
      console.error(err);
      Account.count({city: user.city}, function(countErr, count) {
        if (countErr) {
          console.error(countErr);
        }
        if ((user.role === 'beta' || user.role === 'admin') && count === 1) {
          return res.redirect('/dmd/#/vote');
        }
        return res.redirect('/');
      });
    } else {
      user._voteUser = selectedUser._id;
      user.save( function ( err, user, count ) {
        if (err) {
          console.error(err);
        } else {
          console.log('saved user: '+user.username+' with voteUser:'+user._voteUser);
        }
        if (user.role === 'beta' || user.role === 'admin') {
          return res.redirect('/dmd/#/vote');
        } else {
          return res.redirect('/');
        }
      });
    }
  });
}

router.get('/votee', loggedIn, function(req, res, next) {
  assignVoteeUser(req, res);
});

router.post('/login', function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.error(err);
      req.flash('error', err);
      return res.redirect('/');
    }
    if (!user) {
      console.error('/login no user redirect');
      req.flash('error', 'Problem with user or password');
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) {
        console.error(err);
        req.flash('error', err);
        return res.redirect('/');
      }
      assignVoteeUser(req, res);
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
          return res.redirect('/');
        }
        var password = req.body.password;
        var confirm = req.body.confirm;
        if (password !== confirm) {
          console.error('Requested passwords do not match.');
          req.flash('error', 'Requested passwords do not match.');
          return res.redirect('/');
        }
        user.setPassword(password, function(err, user, passwordErr) {
          if (err || !user) {
            req.flash('error', 'Invalid password requested.');
            return res.redirect('/');
          }
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) {
              console.error('/reset save error:'+err);
              req.flash('error', 'Error saving new password.');
              return res.redirect('/');
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
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      console.error('/reset error:'+err);
      return res.redirect('/');
    }
    res.redirect('/dmd/#/vote');
  });
});

router.get('/sign_s3', function(req, res){
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
  var s3 = new aws.S3();
  var s3_params = {
    Bucket: S3_BUCKET,
    Key: req.query.file_name,
    Expires: 60,
    ContentType: req.query.file_type,
    ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
    if(err){
      console.error(err);
    }
    else{
      var return_data = {
        signed_request: data,
        url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
      };
      res.write(JSON.stringify(return_data));
      res.end();
    }
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
