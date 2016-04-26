var nodemailer    = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

function sendWelcomeEmail(email, username, callback) {
  var subject = 'Design My Day - Registration';
  var text = 'Hello,\n\n' +
        'Welcome! This is a confirmation that you successfully registered an account on Design My Day with email ' +
        email + ' and username ' +
        username + '\n\n' +
        'Visit http://www.designmyday.co and sign in. Presently the app is in the beta testing stage. We would love your' +
        ' feedback and ideas. Use the website contact form or email info@designmyday.co with questions or comments.';
  // TODO: add html version
  var html = undefined;
  sendEmail(email, subject, text, html, callback);
}

function sendActivitySelectionEmail(email, username, activityId, callback) {
  var subject = 'Design My Day - Activity Testimonial';
  var text = 'Hello,\n\n' +
        'You just selected an activity to do something and feel better. As a way to connect with others you can share ' +
        'how doing the activity made you feel after doing it. This helps our community grow.' +
        '\n\n' +
        'When you are ready, visit this testimonial link http://www.designmyday.co/dmd/#/feedback?activityid='+activityId+' ' +
        'and leave your thoughts. You can also do the same from your profile in the Design My Day app.';
  // TODO: add html version
  var html = undefined;
  sendEmail(email, subject, text, html, callback);
}

function sendEmail(toEmail, subject, text, html, callback) {
  var options = {
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
  };
  var transporter = nodemailer.createTransport(smtpTransport(options));
  var mailOptions = {
    to: toEmail,
    from: 'Design My Day <info@designmyday.co>',
    subject: subject,
    text: text,
    html: html
  };
  transporter.sendMail(mailOptions, callback);
}

exports.sendEmail = sendEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendActivitySelectionEmail = sendActivitySelectionEmail;
