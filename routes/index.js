var express       = require('express');
var router        = express.Router();
var passport      = require('passport');
var async         = require('async');
var crypto        = require('crypto');
var nodemailer    = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var aws           = require('aws-sdk');
var crypto        = require('crypto');
var dmdMail       = require('../services/mail');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET      = process.env.S3_BUCKET;

var PREFINERY_DECODER_KEY = process.env.PREFINERY_DECODER_KEY;

var Account  = require('../models/account');

function loggedIn(req, res, next) {
  var user = req.user;
  if (user && (user.role === 'admin' || user.role === 'beta')) {
    next();
  } else {
    res.redirect('/login');
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

function filterUsername(req, res, next) {
  if (req.user) {
    req.user.username = req.user.username.replace(/\s/g, '').toLowerCase();
  }
  if (req.body.username) {
    req.body.username = req.body.username.replace(/\s/g, '').toLowerCase();
  }
  next();
}

router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

function sha1(code) {
  return crypto.createHash('sha1').update(code).digest('hex');
}

function codeIsValid(code, email) {
  var invitationCode = sha1(PREFINERY_DECODER_KEY+email);
  invitationCode = invitationCode.slice(0, 10);
  if (invitationCode === code) {
    // valid code provided
    return true;
  }
  return false;
}

router.get('/signup', function(req, res) {
  var code = req.query.code;
  var email = req.query.email;

  Account.findOne({ email: email }, function(err, user) {
    if (user) {
      req.flash('error', 'An account with the email address '+email+' already exists.');
      return res.redirect('/');
    }

    res.render('register-page', {
      user: {},
      code: code,
      email: email,
      valid: codeIsValid(code, email)
    });
  });
});

router.get('/team', function(req, res) {
  res.render('team', { user : req.user });
});

// router.get('/news', function(req, res) {
//   res.render('news', { user : req.user });
// });

router.get('/tos', function(req, res) {
  res.render('tos', { user : req.user });
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { user : req.user });
});

router.get('/dcma', function(req, res) {
  res.render('dcma', { user : req.user });
});

router.get('/contact', function(req, res) {
  res.render('contact', { user : req.user });
});

router.get('/faq', function(req, res) {
  res.render('faq', { user : req.user });
});

router.get('/postsubmit', function(req, res) {
  res.render('postsubmit', { user : req.user });
});

router.get('/dmd', loggedIn, function(req, res, next) {
  next();
});

router.post('/register', filterUsername, function(req, res) {
  console.log('got /register POST');
  var code = req.body.code;
  var email = req.body.email;
  var username = req.body.username;

  if (!codeIsValid(code, email)) {
    var err = 'Invalid beta invitation code provided for email:'+email+' code:'+code;
    console.error(err);
    req.flash('error', 'Problem registering account: '+err);
    return res.redirect('/');
  }
  if (req.body.password !== req.body.confirm) {
    console.error('/register Passwords do not match');
    req.flash('error', '/register Passwords do not match');
    return res.redirect('/');
  }

  Account.findOne({ email: email }, function(err, user) {
    if (user) {
      req.flash('error', 'An account with the email address '+email+' already exists.');
      return res.redirect('/');
    }

    Account.findOne({ username: username }, function(err, user) {
      if (user) {
        req.flash('error', 'An account with the username '+username+' already exists.');
        return res.redirect('/');
      }

      var citycountry = req.body.citycountry;
      var city;
      var region;
      var country;

      var regex = /([^,]+), ([^,]+), (.+)/;
      if (citycountry) {
        var fields = regex.exec(citycountry);
        if (fields && fields.length === 4) {
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

      Account.register(new Account({
        username : username,
        email: email,
        city: city,
        region: region,
        country: country,
        yearborn: req.body.yearborn
      }), req.body.password, function(err, account) {
        if (err) {
          console.error(err);
          req.flash('error', 'Problem registering account');
          return res.redirect('/');
        }

        passport.authenticate('local')(req, res, function () {
          dmdMail.sendWelcomeEmail(email, username, function(err, response) {
            if (err) {
              console.error('Error sending welcome email:'+err);
              // just ignore emailing error and keep going
            }
            assignVoteeUser(req, res);
          });
        });
      });
    });
  });
});

function assignVoteeUser(req, res) {
  var user = req.user;
  getMostUnvotedUser(user, function(err, selectedUser) {
    if (err) {
      console.error(err);
      Account.count({city: user.city, region: user.region, country: user.country}, function(countErr, count) {
        if (countErr) {
          console.error(countErr);
        }
        var redirectTo = req.session.redirectTo;
        if (req.session.redirectTo) {
          delete req.session.redirectTo;
          return res.redirect(redirectTo);
        } else {
          return res.redirect('/dmd/#/dashboard');
        }
      });
    } else {
      user._voteUser = selectedUser._id;
      user.save( function ( err, user, count ) {
        if (err) {
          console.error(err);
        } else {
          console.log('saved user: '+user.username+' with voteUser:'+user._voteUser);
        }
        var redirectTo = req.session.redirectTo;
        if (req.session.redirectTo) {
          delete req.session.redirectTo;
          return res.redirect(redirectTo);
        } else {
          return res.redirect('/dmd/#/dashboard');
        }
      });
    }
  });
}

router.get('/votee', loggedIn, function(req, res, next) {
  assignVoteeUser(req, res);
});

router.get('/login', function(req, res) {
  if (req.user) {
    // already logged in, redirect to app menu
    return res.redirect('/dmd/#/dashboard');
  }
  return res.render('login-page');
});

router.get('/forgot', function(req, res) {
  if (req.user) {
    // already logged in, redirect to app menu
    return res.redirect('/dmd/#/dashboard');
  }
  return res.render('forgot-page');
});

router.get('/feedback', function(req, res) {
  if (req.user) {
    // already logged in, redirect to app feedback
    return res.redirect('/dmd/#'+req.originalUrl);
  }
  console.log(req.originalUrl);
  req.session.redirectTo = req.originalUrl;
  return res.render('login-page');
});

router.post('/login', filterUsername, function(req, res) {
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
    } else if (user.role === 'deactivated') {
      req.flash('error', 'User has been deactivated. Contact us if you believe this is incorrect.');
      req.logout();
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
  Account.count({city: excludeUser.city, region: excludeUser.region,
    country: excludeUser.country, username: { '$ne': excludeUser.username }})
  .exec(function(err, count) {
    if (count === 0) {
      return callback("ERROR: no users from the voter's city");
    }
    var random = Math.floor(Math.random() * count);

    Account.findOne({city: excludeUser.city, region: excludeUser.region,
    country: excludeUser.country, username: { '$ne': excludeUser.username }})
    .skip(random)
    .exec(function (err, selectedAccount) {
      callback(null, selectedAccount);
    });
  });
}

// TODO: think about keeping track of who voted for today and exclude those users as well
function getMostUnvotedUser (excludeUser, callback) {
  Account.count({city: excludeUser.city, region: excludeUser.region,
      country: excludeUser.country, username: { '$ne': excludeUser.username }})
  .exec(function(err, count) {
    if (count === 0) {
      console.log('no users from the voter city, creating one');
      // return callback("Error: no users from the voter city");
      var pass = (excludeUser.city).replace(/\s/g, '')+'1!';
      Account.register(new Account({
        username: (excludeUser.city+excludeUser.region+excludeUser.country).replace(/\s/g, ''),
        email: (excludeUser.city+excludeUser.region+excludeUser.country).replace(/\s/g, '')+'@designmyday.co',
        city: excludeUser.city,
        region: excludeUser.region,
        country: excludeUser.country,
        yearborn: 1981
      }), pass, function(err, account) {
        console.log('account:'+account);
        if (err) {
          console.error(err);
          return callback(err);
        }
        if (account._id) {
          return callback(null, account);
        } else {
          return callback('Error creating first city account');
        }
      });
    } else {
      Account.findOne({ "$query":{city: excludeUser.city, region: excludeUser.region,
        country: excludeUser.country, username: { '$ne': excludeUser.username }},
        "$orderby":{ "votesReceived": 1 }})
      .exec(function (err, selectedAccount) {
        callback(null, selectedAccount);
      });
    }
  });
}

module.exports = router;
