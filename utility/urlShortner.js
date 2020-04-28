/**
 * @description This file contains functions to short the long url.
 * @file        utility.urlShortner.js
 * @since       25 April 2020
 * @author      Sindooja Gajam
 */

/**
 * @const       urlShortner UrlShortner constant having the `shortid` module
 */

const urlShortner = require('shortid');
let mailSender = require('./nodeMailer');
let service = require('../services/user');
let logger = require('../config/winston');
require('dotenv/').config();

module.exports = {
  /**
   * @description This function generates the short code using the module shortId.
   * @function    shortURL
   * @param {*}   data
   * @param {*}   longURL
   * @param {*}   callback
   */
  shortURL(data, longURL) {
    try {
      let urlCode = urlShortner.generate(longURL);
      let shortUrl = process.env.EMAIL_LONG_URL + urlCode;

      let urlShortenerObject = {
        longUrl: longURL,
        shortUrl: shortUrl,
        urlCode: urlCode,
      };
      // mailSender.sendMail(data.email,shortUrl);
      mailSender.sendMail(data.email, shortUrl);
      return new Promise(function (resolve, reject) {
        service
          .urlShorteningServices(data, urlShortenerObject)
          .then((data) => {
            logger.info('utility', data);
            return resolve(data);
          })
          .catch((error) => {
            logger.error('utility', error);
            return reject(error);
          });
      });

      // ,(error,data)=>{
      //     if(error)
      //     {
      //         return callback(error)
      //     }
      //     else
      //     {
      //         console.log("url-->",data);

      //         return callback(data)
      //     }
      // })
    } catch (error) {
      logger.error(error);
    }
  },
};
