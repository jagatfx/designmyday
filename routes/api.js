var express  = require('express');
var router   = express.Router();
var Activity = require('../models/activity');
var Vote     = require('../models/vote');

router.get('/activity', function(req, res, next) {
  var results = req.query.results;
  var type = req.query.type;
  var city = req.query.city;
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
      res.json( {result: err} );
      return;
    }
    res.json(activities);
  });
});

router.get('/activity/:id', function(req, res, next) {
  Activity.findById(req.params.id, function (err, activity) {
    if (err) {
      res.json( {result: err} );
      return;
    }
    res.json(activity);
  });
});

// TODO: protect POST with authentication / rights
router.post('/activity', function (req, res) {
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

router.post('/activity/:id', function (req, res) {
  // look for existing activity with same URL
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
router.get('/activity/delete/:id', function (req, res) {
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

module.exports = router;
