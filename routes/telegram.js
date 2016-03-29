var express     = require('express');
var router      = express.Router();
var Account     = require('../models/account');
var Activity    = require('../models/activity');


var token = process.env.TELEGRAM_TOKEN;

// // Setup polling way
// var bot = new TelegramBot(token, {polling: true});

// // Matches /echo [whatever]
// bot.onText(/\/echo (.+)/, function (msg, match) {
//   var fromId = msg.from.id;
//   var resp = match[1];
//   bot.sendMessage(fromId, resp);
// });

// // Any kind of message
// bot.on('message', function (msg) {
//   var chatId = msg.chat.id;
//   // photo can be: a file path, a stream or a Telegram file_id
//   var photo = 'http://www.designmyday.co/img/layout.jpg';
//   bot.sendPhoto(chatId, photo, {caption: 'Design My Day'});
// });

router.get('/dmdhook', function (req, res) {
  res.json({ok: true});
});

router.post('/dmdhook', function (req, res) {
  var data = req.body;
  console.log(data);
  res.json({ ok : true });
});

module.exports = router;
