let nodemailer = require('nodemailer');
let logger = require('../config/winston');
require('dotenv/').config();

module.exports = {
  sendMail(email, url) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sindoojagajam@gmail.com',
        pass: 'zjsltiybgopjwpqp',
      },
    });

    let mailOptions = {
      from: 'sindoojagajam@gmail.com',
      to: email,
      subject: 'Sending Email using Node.js',
      text: url,
      url: url,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // logger.error(error);
        console.log('Error------------->', error);
      } else {
        logger.info('Email sent: ' + info.response);
      }
    });
  },
};
