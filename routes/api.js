var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var Account  = require('../models/account');
var Activity = require('../models/activity');
var ObjectId = mongoose.Types.ObjectId;
var multer   = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../public/img/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
  }
});
var upload = multer({ storage: storage }).single('image');

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

function filterUser(user) {
  var currentYear = new Date().getFullYear();
  return {
    _id: user._id,
    username: user.username,
    city: user.city,
    country: user.country,
    yearborn: user.yearborn,
    age: user.yearborn ? currentYear - user.yearborn : 0,
    lastSeverity: user.lastSeverity,
    lastFeeling: user.lastFeeling,
    lastChosenActivity: user.lastChosenActivity,
    _voteUser: user._voteUser,
    activitySelectSequence: user.activitySelectSequence,
    votesCast: user.votesCast,
    votesReceived: user.votesReceived,
    favorites: user.favorites,
    completes: user.completes,
    historicFeelings: user.historicFeelings
  };
}

router.get('/user', loggedIn, function(req, res, next) {
  var user = req.user;
  Account.findOne({_id: user._id})
  .populate('_voteUser')
  .exec(function (err, voter) {
    if (err) {
      console.error(err);
      return res.json( {result: 'Error: getting votee'} );
    }
    var votee = voter._voteUser;

    if (votee) {
      votee = filterUser(votee);
    } else {
      console.info('no votee user found for user:'+user.username+', likely new city:'+user.city);
    }
    var retUser = filterUser(user);
    retUser.votee = votee;
    return res.json(retUser);
  });
});

router.get('/profileactivities', loggedIn, function(req, res, next) {
  var user = req.user;
  Account.findOne({_id: user._id})
  .exec(function (err, voter) {
    if (err) {
      console.error(err);
      return res.json( {result: 'Error: getting user '+err} );
    }

    Activity.find({
      '_id': { $in: user.activitySelectSequence.map(function(activity) { return activity.activity; })}
    }, function(err, activities) {
      if (err) {
        console.error(err);
        return res.json( {result: 'Error: getting user activities'} );
      }
      return res.json(activities);
    });

  });
});

router.get('/mysuggestions', loggedIn, function(req, res, next) {
  var user = req.user;

  Activity.find({'addedBy': user.username}, function(err, activities) {
    if (err) {
      console.error(err);
      return res.json( {result: 'Error: getting mysuggestions '+err} );
    }
    return res.json(activities);
  });
});

router.get('/activity', loggedIn, function(req, res, next) {
  var results = req.query.results;
  var type = req.query.type;
  var user = req.user;
  var city;
  if (user) {
    city = user.city;
  }
  // TODO: implement pagination
  // var page = req.query.page;
  var maxResults = 0;
  var findParam = {};
  if (type) {
    findParam.type = type;
  }
  if (city) {
    console.log('filtering city: '+city);
    findParam.city = city;
  }
  if (results) {
    maxResults = results;
  }
  Activity.find().or([{city: city},{city: ''}]).sort({title: 'asc'}).limit(maxResults).exec(function (err, activities) {
    if (err) {
      console.error(err);
      return res.json( {result: err} );
    }
    res.json(activities);
  });
});

router.get('/activity/:id', loggedIn, function(req, res, next) {
  Activity.findById(req.params.id, function (err, activity) {
    if (err) {
      console.error(err);
      return res.json( {result: err} );
    }
    res.json(activity);
  });
});

router.post('/activity', loggedIn, function (req, res) {
  // look for existing activity with same URL
  Activity.findById(req.params.id, function(err, activity) {
    if(activity) {
      console.log('todo: update existing activity');
      // TODO: do update
      activity.updated_at  = Date.now();
      activity.save( function ( err, activity, count ) {
        if (err) {
          console.error(err);
          return res.json( {result: err} );
        } else {
          console.log('saved activity: '+activity.link);
          res.json( {result: 'OK'} );
        }
      });
    } else {
      new Activity({
        metaActivity     : req.body.metaActivity,
        activityVerb     : req.body.activityVerb,
        activity         : req.body.activity,
        specificLocation : req.body.specificLocation,
        needPass         : req.body.needPass,
        city             : req.body.city,
        country          : req.body.country,
        description      : req.body.description,
        link             : req.body.link,
        img              : req.body.img,
        targetIntensity  : req.body.targetIntensity,
        targetFeelings   : req.body.targetFeelings,
        restrictions     : req.body.restrictions,
        updated_at       : Date.now()
      }).save( function( err, activity, count ) {
        if (err) {
          console.error(err);
          return res.json( {result: err} );
        } else {
          console.log('saved activity: '+activity.link);
          res.json( {result: 'OK'} );
        }
      });
    }
  });
});

router.post('/activityform', loggedIn, function(req, res) {
  var user = req.user;
  upload(req, res, function (err) {
    // // we expect error here because not actually sending image
    // // but using upload to parse out multipart form
    // if (err) {
    //   console.error('upload error when adding activity image:'+err);
    // }

    new Activity({
      activityVerb     : req.body.activityVerb,
      activity         : req.body.activity,
      specificLocation : req.body.specificLocation,
      city             : user.city,
      country          : user.country,
      description      : req.body.description,
      link             : req.body.link,
      img              : req.body.imgurl,
      addedBy          : user.username,
      updated_at       : Date.now()
    }).save( function( err, activity, count ) {
      if (err) {
        console.error(err);
        return res.json( {result: err} );
      } else {
        // after suggesting always vote for the activity
        console.log('saved new activity: '+activity.link);
        return processActivityVote(req, res, activity._id);
      }
    });
  });
});

router.post('/activityform/:id', loggedIn, function(req, res) {
  var user = req.user;
  upload(req, res, function (err) {
    // // we expect error here because not actually sending image
    // // but using upload to parse out multipart form
    // if (err) {
    //   console.error('upload error when adding activity image:'+err);
    // }

    Activity.findById(req.params.id, function(err, activity) {
      if (activity) {
        if (user.username === activity.addedBy) {
          activity.activityVerb     = req.body.activityVerb;
          activity.activity         = req.body.activity;
          activity.specificLocation = req.body.specificLocation;
          activity.description      = req.body.description;
          activity.link             = req.body.link;
          activity.img              = req.body.imgurl;
          activity.updated_at       = Date.now();
          activity.save( function ( err, activity, count ) {
            if (err) {
              console.error(err);
              return res.json( {result: err} );
            } else {
              console.log('saved activity: '+activity._id);
              res.json( {result: 'OK'} );
            }
          });
        } else {
          return res.json( {result: 'error: only the user that suggested the activity can edit it'} );
        }
      }
    });
  });
});

router.post('/activity/:id', loggedIn, function (req, res) {
  Activity.findById(req.params.id, function(err, activity) {
    if (activity) {
      activity.metaActivity     = req.body.metaActivity;
      activity.activityVerb     = req.body.activityVerb;
      activity.activity         = req.body.activity;
      activity.specificLocation = req.body.specificLocation;
      activity.needPass         = req.body.needPass;
      activity.city             = req.body.city;
      activity.country          = req.body.country;
      activity.description      = req.body.description;
      activity.link             = req.body.link;
      activity.img              = req.body.img;
      activity.targetIntensity  = req.body.targetIntensity;
      activity.targetFeelings   = req.body.targetFeelings;
      activity.restrictions     = req.body.restrictions;
      activity.updated_at       = Date.now();
      activity.save( function ( err, activity, count ) {
        if (err) {
          console.error(err);
          return res.json( {result: err} );
        } else {
          console.log('saved activity: '+activity._id);
          // TODO: re-enable API response ajax enabled for admin
          // res.json( {result: 'OK'} );
          res.redirect('/admin/activities');
        }
      });
    }
  });
});

// TODO: protect delete with authentication / rights
router.get('/activity/delete/:id', loggedIn, function (req, res) {
  Activity.findById(req.params.id, function (err, activity) {
    activity.remove( function (err, activity) {
      if (err) {
        console.error(err);
        return res.json( {result: err} );
      }
      res.json( {result: 'OK'} );
    });
  });
});

function updateActivityVotes(activity, feeling, yearBorn, severity) {
  console.log('updating activity votes');
  activity[getFeelingProperty(feeling)]++;

  activity[getAgeProperty(yearBorn)]++;
  activity[getSeverityProperty(severity)]++;

  activity.numVotes++;
}

function getFeelingProperty(feeling) {
  return 'feeling' + feeling.charAt(0).toUpperCase() + feeling.slice(1) + 'Votes';
}

function processActivityVote(req, res, activityId) {
  // TODO: use flow control and cleanup
  Account.findOne({_id: req.user._id})
  .populate('_voteUser')
  .exec(function (err, voter) {
    if (err) {
      return res.json( {result: 'Error: getting votee'} );
    }
    var votee = voter._voteUser;

    if (!votee) {
      return res.json( {result: 'Error: votee required and not found'} );
    }

    var voteeId = votee._id;
    var voterId = voter._id;

    console.log('voteeId:'+voteeId+' voterId:'+voterId+' activityId:'+activityId);

    if (!voteeId || !voterId) {
      return res.json( {result: 'Error: voter and votee ids required and not found'} );
    }
    Account.findById(voteeId, function(voteeErr, votee) {

      if (voteeErr) {
        return res.json( {result: 'Error: voteeErr:' + voteeErr +
          ' with voterId:'+ voterId + ' voteeId:' + voteeId} );
      }

      Activity.findById(activityId, function(activityErr, activity) {

        if (activityErr) {
          return res.json( {result: 'Error: activityErr:' + activityErr +
            ' with voterId:'+ voterId + ' voteeId:' + voteeId +
            ' activityId:' + activityId} );
        }

        var currentYear = new Date().getFullYear();
        votee.votesReceived++;
        voter.votesCast++;

        votee.voteReceiveSequence.push({
          cDate: Date.now(),
          activity: activityId,
          voter: voterId,
          feeling: votee.lastFeeling,
          severity: votee.lastSeverity
        });

        votee.save( function ( err, savedAccountVotee, count ) {
          if (err) {
            return res.json( {result: err} );
          } else {
            console.log('saved account: '+savedAccountVotee._id);

            voter.voteCastSequence.push({
              cDate: Date.now(),
              activity: activityId,
              votee: voteeId,
              feeling: votee.lastFeeling,
              severity: votee.lastSeverity
            });

            voter.save( function ( err, savedAccountVoter, count ) {
              if (err) {
                return res.json( {result: err} );
              } else {
                console.log('saved account: '+savedAccountVoter._id);

                var voteeAge = votee.yearborn ? currentYear - votee.yearborn : 0;
                var voteeFeeling = votee.lastFeeling;
                var voteeSeverity = votee.lastSeverity;

                if (voteeAge < 1 || !voteeFeeling) {
                  return res.json( { result: 'Error: voteeAge:'+voteeAge+' voteeFeeling:'+voteeFeeling } );
                }

                updateActivityVotes(activity, voteeFeeling, votee.yearborn, voteeSeverity);

                activity.save( function ( err, savedActivity, count ) {
                  if (err) {
                    return res.json( {result: err} );
                  } else {
                    console.log('saved activity: '+savedActivity._id);
                    res.json( {result: 'OK'} );
                  }
                });

              }
            });
          }
        });

      });

    });

  });
}

router.get('/vote/:id', loggedIn, function (req, res) {
  var activityId = req.params.id;
  processActivityVote(req, res, activityId);
});

router.get('/feeling/:name', loggedIn, function (req, res) {
  var user = req.user;
  var feeling = req.params.name;
  console.log('feeling set to:'+feeling);
  user.lastFeeling = feeling;
  user.historicFeelings.push({
    fDate: Date.now(),
    feeling: feeling
  });
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

router.get('/severity/:newSeverity', loggedIn, function (req, res) {
  var newSeverity = req.params.newSeverity;
  var user = req.user;
  console.log('severity set to:'+newSeverity);
  user.lastSeverity = newSeverity;
  user.historicSeverity.push({
    fDate: Date.now(),
    severity: newSeverity
  });
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

function getAgeProperty(userYearBorn) {
  var currentYear = new Date().getFullYear();
  var age = userYearBorn ? currentYear - userYearBorn : 0;
  var ageProperty;
  if (age < 18) {
    ageProperty = 'ageu18Votes';
  } else if (age < 25) {
    ageProperty = 'age1824Votes';
  } else if (age < 35) {
    ageProperty = 'age2534Votes';
  } else if (age < 45) {
    ageProperty = 'age3544Votes';
  } else if (age < 55) {
    ageProperty = 'age4554Votes';
  } else if (age < 65) {
    ageProperty = 'age5564Votes';
  } else {
    ageProperty = 'ageo65Votes';
  }
  return ageProperty;
}

function getSeverityProperty(severity) {
  if (severity < 3) {
    return 'lowSeverityVotes';
  } else if (severity > 8) {
    return 'highSeverityVotes';
  } else {
    return 'medSeverityVotes';
  }
}

function getMyMostVotedActivities(user, callback) {
  var maxResultsLimit = 3;
  var sortParam = {
    score: 'desc'
  };
  var city = user.city;

  // filter results to those not picked previously and those either in no city or
  // in the user's city
  var match = {
    $match: {
      _id: {
        $nin: user.activitySelectSequence.map(function(activity) { return new ObjectId(activity.activity); })
      },
      $or: [{city: city}, {city: ''}]
    }
  };

  var feelingProperty = getFeelingProperty(user.lastFeeling);
  var ageProperty = getAgeProperty(user.yearborn);
  var severityProperty = getSeverityProperty(user.lastSeverity);
  // project a score value that is the aggregate of votes for feeling, age, severity
  var project = {
    $project: {
      score: {
        $add: [ "$"+feelingProperty, "$"+ageProperty, "$"+severityProperty ]
      },
      metaActivity: 1,
      activityVerb: 1,
      activity: 1,
      specificLocation: 1,
      needPass: 1,
      city: 1,
      country: 1,
      description: 1,
      link: 1,
      img: 1,
      targetIntensity: 1,
      targetFeelings: 1,
      restrictions: 1,
      activated: 1,
      addedBy: 1
    }
  };

  Activity.aggregate(match, project)
  .sort(sortParam).limit(maxResultsLimit).exec(function (err, activities) {
    if (err) {
      return callback(err);
    }
    callback(null, activities);
  });
}

router.get('/myactivities', loggedIn, function (req, res) {
  var user = req.user;
  getMyMostVotedActivities(user, function(err, activities) {
    if (err) {
      return res.json( {result: err} );
    }
    res.json(activities);
  });
});

router.get('/choose/:id', loggedIn, function (req, res) {
  var activityId = req.params.id;
  var user = req.user;
  user.lastChosenActivity = activityId;
  user.activitySelectSequence.push({
    cDate: Date.now(),
    activity: activityId,
    feeling: user.lastFeeling,
    severity: user.lastSeverity
  });
  // TODO: think about tracking the other two choices that were not selected as well
  console.log('activity chosen:'+activityId);
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

router.post('/feedback/:id', loggedIn, function (req, res) {
  var activityId = req.params.id;
  var user = req.user;
  upload(req, res, function (err) {
    // // we expect error here because not actually sending image
    // // but using upload to parse out multipart form
    // if (err) {
    //   console.error('upload error when adding activity image:'+err);
    // }
    user.feedbackReports.push({
      cDate: Date.now(),
      activity: activityId,
      choice: req.body.choice,
      comment: req.body.comment
    });
    // TODO: think about tracking the other two choices that were not selected as well
    console.log('feedback recorded:'+activityId);
    user.save( function ( err, savedAccount, count ) {
      if (err) {
        return res.json( {result: err} );
      } else {
        res.json( {result: 'OK'} );
      }
    });
  });
});

router.post('/favorite/:id', loggedIn, function (req, res) {
  var user = req.user;
  var activityId = req.params.id;
  user.favorites.push(activityId);
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      console.log('added '+activityId+' to user:'+user._id);
      return res.json( {result: 'OK'} );
    }
  });
});

router.delete('/favorite/:id', loggedIn, function (req, res) {
  var user = req.user;
  var activityId = req.params.id;
  Account.findOneAndUpdate({_id: user._id}, { $pull: {favorites: activityId} }, function(err, data) {
    if (err) {
      return res.json( {result: err} );
    } else {
      return res.json( {result: 'OK'} );
    }
  });
});

router.post('/complete/:id', loggedIn, function (req, res) {
  var user = req.user;
  var activityId = req.params.id;
  user.completes.push(activityId);
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      return res.json( {result: 'OK'} );
    }
  });
});

router.delete('/complete/:id', loggedIn, function (req, res) {
  var user = req.user;
  var activityId = req.params.id;
  Account.findOneAndUpdate({_id: user._id}, { $pull: {completes: activityId} }, function(err, data) {
    if (err) {
      return res.json( {result: err} );
    } else {
      return res.json( {result: 'OK'} );
    }
  });
});


module.exports = router;
