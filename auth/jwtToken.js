/**
 * @description This file have functions to generate and verify token.
 * @file        utility.jwtToken.js
 * @since       25 April 2020
 * @author      Sindooja Gajam
 */

/**
 * @constant    jwt JWT constant having the `jsonwebtoken` module
 */
const jwt = require('jsonwebtoken');
// let redis = require("redis"),
//   client = redis.createClient();
let logger = require('../config/winston');
let redisCache = require('../services/redis');

module.exports = {
  /**
   * @description This function generates token using payload.
   * @function    generateToken
   * @param {*}   payload
   */
  generateToken(payload) {
    let token = jwt.sign(payload, 'private_key');
    return token;
  },

  /**
   * @description This function verfies the user by the token gets the decoded data
   *              by given token
   * @param {*}   req
   * @param {*}   res
   * @param {*}   next
   */
  verifyToken(req, res, next) {
    try {
      logger.info('token1', req.headers, req.params.token);
      // eslint-disable-next-line prefer-destructuring
      let token = req.headers.token || req.params.token;
      if (
        token === undefined ||
        token === '' ||
        Object.keys(token).length === 0 ||
        token === null
      )
        throw 'Token not received';

      if (token !== null && token !== undefined && token !== '') {
        jwt.verify(token, 'private_key', function (err, decoded) {
          if (err) {
            return res.status(400).send(err);
          } else {
            logger.info('url ======' + req.url);
            let route = req.url.split('/');
            logger.info('req.url ' + route[1]);
            let redisData;
            // eslint-disable-next-line default-case
            switch (route[1]) {
              case 'resetpassword': {
                redisData = 'forgetToken';
                break;
              }
              case 'imageupload': {
                redisData = 'loginToken';
                break;
              }
              case 'verifyuser': {
                redisData = 'registrationToken';
                break;
              }
              case 'watchlist': {
                redisData = 'loginToken';
                break;
              }
              case 'removefromwatchlist': {
                redisData = 'loginToken';
                break;
              }
              case 'findone': {
                redisData = 'loginToken';
                break;
              }
            }
            req.body.data = decoded;
            req.token = decoded;
            logger.info('redisdata ' + redisData + req.body.data._id);
            redisCache.get(redisData + req.body.data._id, (reply) => {
              if (reply === token) {
                logger.info('data from redis==> ' + reply);
                next();
              } else {
                logger.error('data from redis ' + reply);
                return res.status(400).send('Invalid Authentication');
              }
            });
          }
        });
      } else {
        logger.info('error');
        res.status(400).send('Token not received');
      }
    } catch (error) {
      logger.info('error ' + error);
      return res.status(400).send(error);
    }
  },
};
