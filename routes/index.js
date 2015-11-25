var express  = require('express');
var passport = require('passport');
var Account  = require('../models/account');
var router   = express.Router();


router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
  res.render('register', { });
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
      res.redirect('/');
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('got /login POST');
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

module.exports = router;
