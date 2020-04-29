let nodemailer = require('nodemailer');
let logger = require('../config/winston');
require('dotenv/').config();

module.exports = {
  sendMail(email, url) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      tls : {
        rejectUnauthorized : false,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL,
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
