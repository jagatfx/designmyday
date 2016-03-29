// var express     = require('express');
// var router      = express.Router();
// var Account     = require('../models/account');
// var Activity    = require('../models/activity');
// var TelegramBot = require('node-telegram-bot-api');

// var token = '142335758:AAHd5RxDAXsMgBs7HUsapQrJIKeyaXQlH_4';
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
//   var photo = 'cats.png';
//   bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
// });

// module.exports = router;
