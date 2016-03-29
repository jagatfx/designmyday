var express     = require('express');
var router      = express.Router();
var Account     = require('../models/account');
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

router.post('/dmdhook', function (req, res) {
  var data = req.body;
  if (!data) {
    return res.json({ ok: false });
  }
  var updateId = data.update_id;
  var message = data.message;
  var mid = message.message_id;
  var from = message.from;
  var chat = message.chat;
  var mDate = message.date;
  var text = message.text;

  var back = {
    ok: true,
    chat_id: chat.id,
    text: text
  }
  res.json(back);
});

module.exports = router;

