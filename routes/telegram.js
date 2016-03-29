var express     = require('express');
var router      = express.Router();
var Activity    = require('../models/activity');


var token = process.env.TELEGRAM_TOKEN;

// Example packet:
// {
//   update_id: 802238593,
//   message: {
//     message_id: 22,
//     from: {
//       id: 209915578,
//       first_name: 'Jacob',
//       username: 'jagatfx'
//     },
//     chat: {
//       id: 209915578,
//       first_name: 'Jacob',
//       username: 'jagatfx',
//       type: 'private'
//     },
//     date: 1459226440,
//     text: 'testing'
//   }
// }

router.get('/dmdhook', function (req, res) {
  res.json({ok: true});
});

function sendIdea (back, res) {
  Activity.count({})
  .exec(function(err, count) {
    if (count === 0) {
      back.text = 'I am all out of ideas!';
      return res.json(back);
    }
    var random = Math.floor(Math.random() * count);

    Activity.findOne({})
    .skip(random)
    .exec(function (err, activity) {
      if (err) {
        console.error(err);
        back.text = 'Oops, I had a problem';
      } else {
        back.text = activity.activityVerb + ' ' + activity.activity + ' ' + activity.specificLocation;
        if (activity.city && activity.city != '') {
          back.text += ' (' + activity.city + ', ' + activity.country + ')';
        }
      }
      return res.json(back);
    });
  });
}

router.post('/dmdhook', function (req, res) {
  var data = req.body;
  console.log(req.body);
  if (!data || !data.message) {
    return res.json({ ok: false });
  }
  var updateId = data.update_id;
  var message = data.message;
  var mid = message.message_id;
  var from = message.from;
  var chat = message.chat;
  var mDate = message.date;
  var text = message.text;
  var cmd;
  var back = {
    ok: true,
    method: 'sendMessage',
    chat_id: chat.id,
    text: 'Sorry, I do not understand. Try /help for my commands'
  };

  if (text.startsWith('/')) {
    cmd = text.substr(1, text.length);
    switch (cmd) {
      case 'echo':
        back.text = text;
        break;
      case 'start':
        back.text = 'hello, '+chat.username+', welcome to Design My Day! Send me a command like /idea';
        break;
      case 'help':
        back.text = 'idea - Get out of your funk with unusual quirky ideas that have worked for others\n' +
                   'city - Set the city you are interested in\n' +
                   'vote - Vote on ideas for someone else\n' +
                   'suggest - Suggest a new idea that people should do\n' +
                   'feeling - Tell how you are feeling';
        break;
      case 'idea':
        sendIdea(back, res);
        return;
      case 'city':
        back.text = 'I have not yet figured out this feature yet, coming soon!';
        break;
      case 'vote':
        back.text = 'I have not yet figured out this feature yet, coming soon!';
        break;
      case 'suggest':
        back.text = 'I have not yet figured out this feature yet, coming soon!';
        break;
      case 'feeling':
        back.text = 'I have not yet figured out this feature yet, coming soon!';
        break;
    }
  }

  res.json(back);
});

module.exports = router;

