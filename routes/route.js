/**
 * @description This file specific the controller function for the routes
 * @file        routes.routes.js
 * @overview    According to the http methods the routes/express-router specific
 *              the controller function or the next destination for the specified
 *              route.
 * @author      Sindooja Gajam
 * @version     node v12.10.0
 * @since       17 December 2019
 */

/**
 * @const      routes Routes constant having the `express.Router` module
 */

const express = require('express');
const multer = require('multer');

const routes = express.Router();
const user = require('../controller/user');
const userModel = require('../app/model/user');
const actor = require('../controller/actors');
const movie = require('../controller/movies');
const producer = require('../controller/producers');
const logger = require('../config/winston');
let jwt = require('../auth/jwtToken');
let uploads = require('../services/s3');

let singleUpload = uploads.single('image');
const upload = multer({ dest: 'uploads/' });

routes.post('/register', user.createController);

routes.post('/login', user.loginController);

routes.post('/forgotpassword', user.forgetPasswordController);

routes.post('/resetpassword', jwt.verifyToken, user.resetPasswordController);

routes.get('/verify/:url', (request, response) => {
  console.log('urlcode======>', request.params.url);
  userModel.findOne({ urlCode: request.params.url }, (error, data) => {
    if (error) {
      return response.status(404).send('Url not found');
    } else {
      console.log('data------------>', data.longUrl);
      response.redirect(data.longUrl);
    }
  });
});

routes.post('/verifyuser/:token', jwt.verifyToken, user.isVerifiedController);

routes.post('/imageupload', jwt.verifyToken, function (request, response) {
  logger.info('req ', JSON.stringify(request.body));
  let imageSaveObject = {};
  imageSaveObject.id = request.body.data._id;

  singleUpload(request, response, function (error) {
    let res = {};
    if (error) {
      logger.info('err', error);
      res.message = error;
      res.success = false;
      return response.status(500).send(res);
    } else {
      logger.info('data', request.body);
      logger.info('file', request.file.location);

      imageSaveObject.imageUrl = request.file.location;
      logger.info(imageSaveObject);
      user
        .uploadImageController(imageSaveObject)
        .then((data) => {
          res.message = 'Successfully saved';
          res.success = true;
          res.data = data.imageUrl;
          return response.status(200).send(res);
        })
        .catch((error) => {
          res.error = error;
          res.success = false;
          return response.status(500).send(res);
        });
    }
  });
});

// Routes for actors
routes.post('/actor', actor.addActor);
routes.get('/actor', actor.getAllActor);
routes.delete('/actor/:actorId', actor.delete);
routes.put('/actor/:actorId', actor.update);

// Routes for movies
routes.post('/addmovie', movie.addMovie);
routes.post('/addactor/:movieId', movie.addActorInMovie);
routes.post('/removeactor/:movieId', movie.removeActorFromMovie);
routes.post('/addproducer/:movieId', movie.addProducer);
routes.post('/removeproducer/:movieId', movie.removeProducer);
routes.post('/movieposter/:movieId', upload.single('image'), movie.moviePoster);
routes.get('/movie', movie.getAllMovies);
routes.get('/movie/:movieId', movie.getMovie);
routes.delete('/movie/:movieId', movie.delete);
routes.put('/movie/:movieId', movie.editMovie);

// Routes for producers
routes.post('/producer', producer.create);
routes.get('/producer', producer.getAllProducers);
routes.get('/producer/:producerId', producer.findOne);
routes.delete('/producer/:producerId', producer.delete);
routes.put('/producer/:producerId', producer.update);

module.exports = routes;
