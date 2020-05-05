/**
 * @description API controller Class
 * @file        controller.user.js
 * @overview    API controller class controls all the API's, gives call to
 *              service functions of the API's
 * @author      Sindooja Gajam
 * @version     node v12.10.0
 * @since       16 December 2019
 */
let userServices = require('../services/user');
let jsonWebToken = require('../auth/jwtToken');
let mailSender = require('../utility/nodeMailer');
let urlShortner = require('../utility/urlShortner');
let logger = require('../config/winston');
let redisCache = require('../services/redis');
// var mail = require('../utility/mailer');

class Controller {
  /**
   * @description This function is called to register the user (i.e. to save the user
   *              info to the database) by calling the service function
   * @function    createController
   * @param {*}   request
   * @param {*}   response
   */
  createController(request, response) {
    try {
      // console.log("error handling",request.body);
      if (
        request.body.firstName === null ||
        request.body.lastName === null ||
        request.body.email === null ||
        request.body.password === null
      )
        throw 'Request body cannot be null';
      if (
        request.body.firstName === undefined ||
        request.body.lastName === undefined ||
        request.body.email === undefined ||
        request.body.password === undefined
      )
        throw 'Request body cannot be undefined';
      if (
        request.body.firstName === '' ||
        request.body.lastName === '' ||
        request.body.email === '' ||
        request.body.password === ''
      )
        throw 'Request body cannot be empty string';

      request
        .check('firstName', 'First name must be 3 character long')
        .isLength({
          min: 3,
        });
      request
        .check('firstName', 'First Name must be character string only')
        .isAlpha();
      // request.check('lastName','Last name cannot be empty').isEmpty()
      request.check('lastName', 'Last name must be 3 character long').isLength({
        min: 3,
      });
      request
        .check('lastName', 'Last Name must be character string only')
        .isAlpha();
      request.check('email', 'Email must be in email format').isEmail();
      request
        .check(
          'password',
          'Password must include one lowercase character, one uppercase character, a number, a special character and atleast 8 character long'
        )
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
          'i'
        );
      let errors = request.validationErrors();
      let result = {};
      // console.log(errors);
      if (errors) {
        result.error = errors;
        result.success = false;
        return response.status(400).send(result);
      } else {
        let userData = {
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          email: request.body.email,
          password: request.body.password,
        };
        // console.log("in controller");
        return new Promise(function (resolve, reject) {
          userServices
            .createService(userData)
            .then((data) => {
              if (data.success !== false) {
                // console.log("data in res from ser", data);
                // console.log("data in response---", data);
                let payload = {
                  _id: data._id,
                };

                let jwtToken = jsonWebToken.generateToken(payload);
                let longURL = process.env.LONG_URL + jwtToken;
                // console.log("long url",longURL)
                redisCache.set(
                  'registrationToken' + data._id,
                  jwtToken,
                  (reply) => {
                    if (reply) {
                      urlShortner
                        .shortURL(data, longURL)
                        .then((data) => {
                          // console.log("sh--->", data);
                          result.message = 'Successfully registered';
                          result.success = true;
                          result.data = data;
                          return response.status(200).send(result);
                        })
                        .catch((error) => {
                          result.error = error;
                          result.message = 'Error while saving the url data';
                          return response.status(501).send(result);
                        });
                    }
                  }
                );
              } else {
                // console.log("data---------->", data)
                result.message = data.message;
                result.success = data.success;
                result.data = data.data;
                return response.status(500).send(result);
              }
            })
            .catch((error) => {
              result.error = error;
              result.message = 'Some error occurred';
              result.success = false;
              return response.status(500).send(result);
            });
        });
      }
    } catch (error) {
      let result = {};
      result.error = error;
      result.status = false;
      return response.status(400).send(result);
    }
  }

  /**
   * @description This function is called when user wants to login, this function further
   *              gives the call to service function
   * @function    readController
   * @param {*}   request
   * @param {*}   response
   */
  loginController(request, response) {
    try {
      // if (request.body.email === null || request.body.password === null) throw ("Request body cannot be null");
      request.check('email', 'Email must be in email format').isEmail();
      request
        .check(
          'password',
          'Password must include one lowercase character, one uppercase character, a number, a special character and atleast 8 character long'
        )
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
          'i'
        );

      let errors = request.validationErrors();
      let result = {};

      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        return response.status(400).send(result);
      } else {
        let readData = {
          email: request.body.email,
          password: request.body.password,
        };

        userServices.loginService(readData, (error, data) => {
          // console.log("ctrl==>", data);
          if (error) {
            result.error = error;
            result.success = false;
            return response.status(500).send(result);
          } else if (data.success !== false) {
            // console.log(data)
            let payload = {
              _id: data.data._id,
            };
            let jwtToken = jsonWebToken.generateToken(payload);
            redisCache.set('loginToken' + payload._id, jwtToken, (reply) => {
              if (reply) {
                result.token = jwtToken;
                result.message = 'Login successful';
                result.success = true;
                result.data = data;
                return response.status(200).send(result);
              }
            });
          } else {
            result.message = data.message;
            result.success = data.success;
            result.data = data.data;
            return response.status(500).send(result);
          }
        });
      }
    } catch (error) {
      let result = {};
      result.error = error;
      result.status = false;
      return response.status(400).send(result);
    }
  }

  /**
   * @description This controller function is called when the registered user click on to
   *              the link sent to email, then the further call is given to the service
   *              function.
   * @function    isVerifiedController
   * @param {*}   request
   * @param {*}   response
   */
  isVerifiedController(request, response) {
    let result = {};
    // console.log("verifyC");
    userServices
      .isVerifiedService(request)
      .then((data) => {
        result.data = data;
        result.success = true;
        result.verified = true;
        return response.status(200).send(result);
      })
      .catch((error) => {
        result.error = error;
        result.success = false;
        return response.status(500).send(result);
      });
  }

  /**
   * @description This controller is called when the user click on to the forget password.
   * @function    forgetPasswordController
   * @param {*}   request
   * @param {*}   response
   */
  forgetPasswordController(request, response) {
    try {
      // if (request.body.email === null)  throw "Request body cannot be null";

      request.check('email', 'Email must be in email format').isEmail();
      let errors = request.validationErrors();
      let result = {};

      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        return response.status(400).send(result);
      } else {
        // console.log("forgot")
        let result = {};
        let forgotPassword = {
          email: request.body.email,
        };
        userServices.forgetPassword(forgotPassword, (error, data) => {
          if (error) {
            result.error = error;
            result.succes = false;
            return response.status(500).send(result);
          } else {
            logger.info('response data in controller', data);
            let payload = {
              _id: data._id,
            };
            // console.log("dtttt===", data);
            let jwtToken = jsonWebToken.generateToken(payload);
            logger.info('token' + jwtToken);
            redisCache.set('forgetToken' + data._id, jwtToken, (reply) => {
              if (reply) {
                let url = process.env.EMAIL_FRONTEND_URL + jwtToken;
                mailSender.sendMail(data.email, url);

                // mailSender.sendMail(data.email, url);
                result.message = 'Mailsent';
                result.success = true;
                return response.status(200).send(result);
              }
            });
          }
        });
      }
    } catch (error) {
      let result = {};
      result.error = error;
      result.status = false;
      return response.status(400).send(result);
    }
  }

  /**
   * @description This function is called when the user wants to reset the password.
   * @function    resetPasswordController
   * @param {*}   request
   * @param {*}   response
   */
  resetPasswordController(request, response) {
    request
      .check(
        'password',
        'Password must include one lowercase character, one uppercase character, a number, a special character and atleast 8 character long'
      )
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, 'i');
    let errors = request.validationErrors();
    let result = {};

    if (errors) {
      result.error = errors[0].msg;
      result.success = false;
      return response.status(400).send(result);
    } else {
      let result = {};
      let resetPassword = {
        password: request.body.password,
        id: request.body.data._id,
      };
      userServices
        .resetPassswordService(resetPassword)
        .then((data) => {
          // console.log("aaa", data)
          result.data = data;
          result.success = true;

          return response.status(200).send(result);
        })
        .catch((error) => {
          // console.log("errrrrr", error)
          result.error = error;
          result.message = error;
          result.success = false;

          return response.status(500).send(result);
        });
    }
  }

  /**
   * @description This function is called when the user wants to add profile photo.
   * @function    uploadImageController
   * @param {*}   request
   * @param {*}   response
   */
  uploadImageController(request, response) {
    return new Promise(function (resolve, reject) {
      userServices
        .imageUploadService(request)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  addMovieInWatchList(request, response) {
      let watchlistObject = {
        movieId: request.params.movieId,
        userId: request.body.data._id,
      };
      let result = {};
      userServices.addMovieInWatchList(watchlistObject)
        .then((data) => {
          result.success = true;
          result.message = 'Successfully added movie to users watchlist';
          result.data = data;
          return response.status(200).send(result);
        })
        .catch((error) => {
          result.success = false;
          result.message = 'Unsuccessfully adding movie to users watchlist';
          result.error = error;
          return response.status(500).send(result);
        });
  }

  removeMovieFromWatchList(request, response) {
      let result = {};
      logger.info('in func');

      let removeActorObject = {
        movieId: request.params.movieId,
        userId: request.body.data._id,
      };
      userServices
        .removeMovieFromWatchList(removeActorObject)
        .then((data) => {
          if (data != null) {
            result.success = true;
            result.message = 'Removed movie from the users watchlist';
            result.data = data;
            return response.status(200).send(result);
          } else {
            result.success = false;
            result.message = "Movie wasn't removed from the users watchlist";
            result.data = data;
            return response.status(400).send(result);
          }
        })
        .catch((error) => {
          result.success = false;
          result.message = 'Error Occurred while removing movie from watchlist';
          result.error = error;
          return response.status(500).send(result);
        }); 
  }
}

module.exports = new Controller();