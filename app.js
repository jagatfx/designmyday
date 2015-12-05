// mongoose setup
require( './db' );

var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var engine        = require('ejs-locals');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes        = require('./routes');
var apiRouter     = require('./routes/api');
var adminRouter   = require('./routes/admin');

var app = express();

// view engine setup
app.engine( 'ejs', engine );
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9',
  resave: false,
  saveUninitialized: false
}));
// app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next) {
//   res.locals._csrf = req.session._csrf;
//   return next();
// });

app.use('/', routes);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('error: '+err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send('error: '+err.message);
});


module.exports = app;
