var express  = require('express');
var router   = express.Router();
var Account  = require('../models/account');
var Activity = require('../models/activity');

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.json( {result: 'ERROR: API calls require a logged in user'} );
  }
}

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
  Activity.find(findParam).sort({title: 'asc'}).limit(maxResults).exec(function (err, activities) {
    if (err) {
      return res.json( {result: err} );
    }
    res.json(activities);
  });
});

router.get('/activity/:id', loggedIn, function(req, res, next) {
  Activity.findById(req.params.id, function (err, activity) {
    if (err) {
      res.json( {result: err} );
      return;
    }
    res.json(activity);
  });
});

// TODO: protect POST with authentication / rights
router.post('/activity', loggedIn, function (req, res) {
  // look for existing activity with same URL
  Activity.findById(req.params.id, function(err, activity) {
    if(activity) {
      console.log('todo: update existing activity');
      // TODO: do update
      activity.updated_at  = Date.now();
      activity.save( function ( err, activity, count ) {
        if (err) {
          res.json( {result: err} );
          return;
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
          res.json( {result: err} );
          return;
        } else {
          console.log('saved activity: '+activity.link);
          res.json( {result: 'OK'} );
        }
      });
    }
  });
});

router.post('/activity/:id', loggedIn, function (req, res) {
  Activity.findById(req.params.id, function(err, activity) {
    if(activity) {
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
          res.json( {result: err} );
          return;
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
        res.json( {result: err} );
        return;
      }
      res.send( {result: 'OK'} );
    });
  });
});

router.get('/vote/:id', loggedIn, function (req, res) {
  var activityId = req.params.id;

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
      return res.send( {result: 'Error: voter and votee ids required and not found'} );
    }
    Account.findById(voteeId, function(voteeErr, votee) {

      if (voteeErr) {
        return res.send( {result: 'Error: voteeErr:' + voteeErr +
          ' with voterId:'+ voterId + ' voteeId:' + voteeId} );
      }

      Activity.findById(activityId, function(activityErr, activity) {

        if (activityErr) {
          return res.send( {result: 'Error: activityErr:' + activityErr +
            ' with voterId:'+ voterId + ' voteeId:' + voteeId +
            ' activityId:' + activityId} );
        }

        var currentYear = new Date().getFullYear();
        votee.votesReceived++;
        voter.votesCast++;

        votee.save( function ( err, savedAccountVotee, count ) {
          if (err) {
            return res.json( {result: err} );
          } else {
            console.log('saved account: '+savedAccountVotee._id);

            voter.save( function ( err, savedAccountVoter, count ) {
              if (err) {
                return res.json( {result: err} );
              } else {
                console.log('saved account: '+savedAccountVoter._id);

                var voteeAge = votee.yearborn ? currentYear - votee.yearborn : 0;
                var voteeFeeling = votee.lastFeeling;

                if (voteeAge < 1 || !voteeFeeling) {
                  return res.send( { result: 'Error: voteeAge:'+voteeAge+' voteeFeeling:'+voteeFeeling } );
                }

                if (voteeFeeling == 'worried') {
                  activity.feelingWorriedVotes++;
                } else if(voteeFeeling == 'emotional') {
                  activity.feelingEmotionalVotes++
                } else if(voteeFeeling == 'unfocused') {
                  activity.feelingUnfocusedVotes++;
                } else if(voteeFeeling == 'bored') {
                  activity.feelingBoredVotes++;
                } else if(voteeFeeling == 'stressed') {
                  activity.feelingStressedVotes++;
                } else if(voteeFeeling == 'lethargic') {
                  activity.feelingLethargicVotes++;
                } else if(voteeFeeling == 'angry') {
                  activity.feelingAngryVotes++;
                } else if(voteeFeeling == 'isolated') {
                  activity.feelingIsolatedVotes++;
                } else if(voteeFeeling == 'fine') {
                  activity.feelingFineVotes++;
                }

                if (voteeAge < 18) {
                  activity.ageu18Votes++;
                } else if (voteeAge < 25) {
                  activity.age1824Votes++;
                } else if (voteeAge < 35) {
                  activity.age2534Votes++;
                } else if (voteeAge < 45) {
                  activity.age3544Votes++;
                } else if (voteeAge < 55) {
                  activity.age4554Votes++;
                } else if (voteeAge < 65) {
                  activity.age5564Votes++;
                } else {
                  activity.ageo65Votes++;
                }

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

});

router.get('/feeling/:name', loggedIn, function (req, res) {
  var user = req.user;
  var feeling = req.params.name;
  console.log('feeling set to:'+feeling);
  user.lastFeeling = feeling;
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

router.get('/severity/:name', loggedIn, function (req, res) {
  var severity = req.params.name;
  var user = req.user;
  console.log('severity set to:'+severity);
  user.lastSeverity = severity;
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

function getMyMostVotedActivities(user, callback) {
  var maxResultsLimit = 3;
  var findParam = {
    city: user.city
  };
  Activity.find(findParam).sort({title: 'asc'}).limit(maxResultsLimit).exec(function (err, activities) {
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
    activities.forEach(function(activity) {
      console.log(activity);
      activity.numVotes = activity.ageu18Votes +
        activity.age1824Votes +
        activity.age1824Votes +
        activity.age2534Votes +
        activity.age3544Votes +
        activity.age4554Votes +
        activity.age5564Votes +
        activity.ageo65Votes +
        activity.feelingWorriedVotes +
        activity.feelingEmotionalVotes +
        activity.feelingUnfocusedVotes +
        activity.feelingBoredVotes +
        activity.feelingStressedVotes +
        activity.feelingLethargicVotes +
        activity.feelingAngryVotes +
        activity.feelingIsolatedVotes +
        activity.feelingFineVotes;
      activity.numVotes = activity.numVotes / 2;
    });
    res.json(activities);
  });
});

router.get('/choose/:id', loggedIn, function (req, res) {
  var activityId = req.params.id;
  var user = req.user;
  user.lastChosenActivity = activityId;
  console.log('activity chosen:'+activityId);
  user.save( function ( err, savedAccount, count ) {
    if (err) {
      return res.json( {result: err} );
    } else {
      res.json( {result: 'OK'} );
    }
  });
});

module.exports = router;
