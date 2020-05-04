/**
 * @description API controller Class
 * @file        controller.movies.js
 * @overview    API controller class controls all the API's, gives call to
 *              service functions of the API's
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       02 April 2020
 */

let movieService = require('../services/movies');
let logger = require('../config/winston');
let actorService = require('../services/actors');
let producerService = require('../services/producers');
let movieModel = require('../app/model/movies');
let upload = require('../services/s3');
let signedUrl = require('../services/preSignedUrlS3');

class MovieController {
  addMovie(request, response) {
    try {
      if (
        request.body.name === undefined ||
        request.body.yearOfRelease === undefined ||
        request.body.plot === undefined ||
        request.body.releaseDate === undefined
      )
        throw 'Request body cannot be undefined';
      if (
        request.body.name === null ||
        request.body.yearOfRelease === null ||
        request.body.plot === null ||
        request.body.releaseDate === null
      )
        throw 'Request body cannot be null';
        logger.info("checkinh request body")
      request
        .check('yearOfRelease', 'Year Of Release must be number')
        .isNumeric();
      request
        .check('yearOfRelease', 'Year should be in year format')
        .matches(/^[0-9]{4}$/);
      // request.check("plot", "Plot must be character string").isAlpha();
      request
        .check(
          'releaseDate',
          'Date of release must be in DD/MM/YYYY or DD-MM-YYYY'
        ).isISO8601().toDate()
        // .isISO8601(request.body.releaseDate.toISOString());
        // .matches(
        //   /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
        // );

      let errors = request.validationErrors();
      let result = {};

      if (errors) {
        logger.error("error-->"+ JSON.stringify(errors));
        result.error = errors;
        result.success = false;
        request.message = errors.msg;
        return response.status(400).send(result);
      } else {
        logger.info("in else =============>", +request.body);
        let addMovieObject = {
          actors: [{}],
        };
        let createActorObject = {};

        let createObject = {};
        createObject = {
          name: request.body.producer.name,
          sex: request.body.producer.sex || null,
          dob: request.body.producer.dob || null,
          bio: request.body.producer.bio || null,
        };
        producerService
          .create(createObject)
          .then((data) => {
            addMovieObject = {
              producer: data._id,
              name: request.body.name,
              yearOfRelease: request.body.yearOfRelease,
              plot: request.body.plot,
              releaseDate: request.body.releaseDate,
              // rating: request.body.rating,
            };
            logger.info(
              'data after adding actor ' + JSON.stringify(addMovieObject)
            );
            movieService
              .addMovie(addMovieObject)
              .then((reply) => {
                logger.info(
                  'actors length ------------------>' +
                  request.body.actors.length
                );
                let count = 0;
                if (Object.keys(request.body.actors).length !== 0) {
                  request.body.actors.forEach((element) => {
                    createActorObject = {
                      name: element.name,
                      sex: element.sex || null,
                      dob: element.dob || null,
                      bio: element.bio || null,
                    };
                    actorService.addActor(createActorObject).then((data) => {
                      movieModel
                        .update(
                          { _id: reply._id },
                          { $push: { actors: data._id } }
                        )
                        .then((data) => {
                          count++;
                          if (
                            count === Object.keys(request.body.actors).length
                          ) {
                            logger.info('count==================>' + count);
                            result.data = data;
                            result.success = true;
                            result.message = 'Added successfully';
                            return response.status(200).send(result);
                          }
                        })
                        .catch((error) => {
                          logger.error('error------->' + error);
                          result.error = error;
                          result.success = false;
                          result.message =
                            "Request couldn't completely be processed";
                          return response.status(500).send(result);
                        });
                    });
                  });
                } else {
                  result.success = true;
                  result.message = 'Movie details added successfully';
                  result.data = reply;
                  return response.status(200).send(result);
                }
              })
              .catch((error) => {
                logger.error('error in catch------->' + error);
                result.error = error;
                result.success = false;
                result.message = 'Request failed while creating movie';
                return response.status(500).send(result);
              });
          })
          .catch((error) => {
            logger.error('error in pcatch------->' + error);
            result.error = error;
            result.success = false;
            result.message = 'Request failed while creating producer';
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      logger.error('error in try catch------->' + error);
      let result = {};
      result.success = false;
      result.message = 'Request body is missing an entity';
      result.error = error;
      return response.status(400).send(result);
    }
  }

  addActorInMovie(request, response) {
    try {
      if (
        request.body.actorName === undefined ||
        request.body.actorName === null
      )
        throw 'Request body cannot be undefined';

      request
        .check(
          'actorName',
          "Actor's name must be character string only e.g.(John Latin)"
        )
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);

      let errors = request.validationErrors();
      let result = {};

      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        result.message = 'Validation Error';
        return response.status(400).send(result);
      } else {
        let actorNameObject = {
          actorName: request.body.actorName,
        };
        let movieObject = {
          movieId: request.params.movieId,
        };
        movieService
          .addActorInMovie(actorNameObject, movieObject)
          .then((data) => {
            result.success = true;
            result.message = 'Successfully added actor to movie';
            result.data = data;
            return response.status(200).send(result);
          })
          .catch((error) => {
            result.success = false;
            result.message = 'Unsuccessfully adding actor to movie';
            result.error = error;
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = 'Request body should contain actorName';
      result.error = error;
      return response.status(400).send(result);
    }
  }

  removeActorFromMovie(request, response) {
    try {
      let result = {};
      logger.info('in func');
      if (request.body.actorId === undefined || request.body.actorId === null)
        throw 'Request body should contain actorId';

      let removeActorObject = {
        movieId: request.params.movieId,
        actorId: request.body.actorId,
      };
      movieService
        .removeActorFromMovie(
          { _id: removeActorObject.movieId },
          removeActorObject
        )
        .then((data) => {
          if (data != null) {
            result.success = true;
            result.message = 'Removed actor from the movie';
            result.data = data;
            return response.status(200).send(result);
          } else {
            result.success = false;
            result.message = "Actor wasn't removed from the movie";
            result.data = data;
            return response.status(400).send(result);
          }
        })
        .catch((error) => {
          result.success = false;
          result.message = 'Eccor Occurred';
          result.error = error;
          return response.status(400).send(result);
        });
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = 'Incomplete request';
      result.error = error;
      return response.status(500).send(result);
    }
  }

  getAllMovies(request, response) {
    let result = {};
    movieService
      .getAllMovies()
      .then((data) => {
        if (data !== null) {
          result.success = true;
          result.message = 'Successfull got all movies';
          result.data = data;
          return response.status(200).send(result);
        } else {
          result.success = true;
          result.message = 'No data found';
          result.data = data;
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        result.success = false;
        result.message = 'Unable to get all movies';
        result.error = error;
        return response.status(500).send(error);
      });
  }

  moviePoster(request, response) {
    let posterObject = {};
    posterObject.id = request.params.movieId;
    let res = {};

    // singleUpload(request, response, function (error) {
    //     if (error) {
    //         res.message = "Error while saving image in aws s3";
    //         res.error = error;
    //         res.success = false;
    //         return response.status(500).send(res);
    //     } else {
    //         let buf = Buffer.from(request.file.location);
    //         let encodeUrl = buf.toString('base64');
    //         let decodedUrl = new Buffer(encodeUrl, 'base64');
    //         let text = decodedUrl.toString('ascii');
    //         // posterObject.imageUrl = request.file.location;
    //         posterObject.imageUrl = encodeUrl;
    //         movieService.moviePoster(posterObject).then(data => {
    //             res.message = "Successfully Saved";
    //             res.sucess = true;
    //             res.data = data;
    //             return response.status(200).send(res)
    //         })
    //             .catch(error => {
    //                 res.error = error;
    //                 res.message = "Error while saving the data"
    //                 res.success = false;
    //                 return response.status(400).send(res)
    //             })
    //     }
    // })
    signedUrl.getSignedUrl(request, (error, data) => {
      if (error) {
        res.message = 'Error while saving image in aws s3';
        res.error = error;
        res.success = false;
        return response.status(500).send(res);
      } else {
        posterObject.imageUrl = data;
        movieService
          .moviePoster(posterObject)
          .then((data) => {
            res.message = 'Successfully Saved';
            res.sucess = true;
            res.data = data;
            return response.status(200).send(res);
          })
          .catch((error) => {
            res.error = error;
            res.message = 'Error while saving the data';
            res.success = false;
            return response.status(400).send(res);
          });
      }
    });
  }

  delete(request, response) {
    try {
      let result = {};
      if (
        request.params.movieId === undefined ||
        request.params.movieId === null
      )
        throw 'Request should contain the ID';

      movieService
        .delete({ _id: request.params.movieId })
        .then((data) => {
          if (data !== null) {
            result.data = data;
            result.message = 'Deleted Successfully';
            result.success = true;
            return response.status(200).send(result);
          } else {
            result.success = true;
            result.message = 'No date found';
            result.data = data;
            return response.status(404).send(result);
          }
        })
        .catch((error) => {
          result.error = error;
          result.message = 'Delete Unsuccessfully';
          result.success = false;
          return response.status(500).send(error);
        });
    } catch (error) {
      let result = {};
      result.error = error;
      result.message = 'Requets body does not contain all the entities';
      result.success = false;
      return response.status(400).send(error);
    }
  }

  editDetails(request, response) {
    try {
      if (
        request.params.movieId === undefined ||
        request.params.movieId === null
      )
        throw 'Request must contain the movieId';

      request
        .check('name', 'Name must be character string only e.g.(John Latin)')
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);
      request
        .check('yearOfRelease', 'Year Of Release must be numberis')
        .isNumeric();
      request.check('plot', 'Plot must be character string').isAlpha();
      request
        .check('yearOfRelease', 'Year should be in year format')
        .matches(/^[0-9]{4}$/);

      let errors = request.validationErrors();
      let result = {};
      if (errors) {
        result.error = errors[0].msg;
        result.success = false;
        return response.status(400).send(result);
      } else if (
        'name' in request.body &&
        'yearOfRelease' in request.body &&
        'plot' in request.body
      ) {
        let editObject = {};
        let idObject = {
          movieId: request.params.movieId,
        };

        editObject.name = request.body.name;
        editObject.yearOfRelease = request.body.yearOfRelease;
        editObject.plot = request.body.plot;

        movieService
          .editDetails(idObject, editObject)
          .then((data) => {
            if (data !== null) {
              result.success = true;
              result.message = 'Updated Successfully';
              result.data = data;
              return response.status(200).send(result);
            } else {
              result.success = true;
              result.message = 'NO movie found..!!!';
              result.data = data;
              return response.status(404).send(result);
            }
          })
          .catch((error) => {
            result.success = false;
            result.message = 'Error Occured';
            result.error = error;
            return response.status(500).send(result);
          });
      } else {
        result.success = false;
        result.message = 'Please add all the fields';
        result.error = 'Please add all the fields';
        return response.status(400).send(result);
      }
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = 'Field is missing';
      result.error = error;
      return response.status(400).send(result);
    }
  }

  addProducer(request, response) {
    try {
      if (
        request.body.producerName === undefined ||
        request.body.producerName === null
      )
        throw 'Request body cannot be undefined or null';

      request
        .check(
          'producerName',
          'Producer Name must be character string only e.g.(John Latin)'
        )
        .matches(/^[a-zA-Z]+ [a-zA-Z]+$/);

      let errors = request.validationErrors();
      let result = {};

      if (errors) {
        result.message = 'Producer name must be character string only';
        result.success = false;
        result.error = errors[0].msg;
        return response.status(400).send(result);
      } else {
        let producerObject = {
          producerName: request.body.producerName,
          movieId: request.params.movieId,
        };

        movieService
          .addProducer(producerObject)
          .then((data) => {
            result.message = 'Successfully added producer';
            result.success = true;
            result.data = data;
            return response.status(200).send(result);
          })
          .catch((error) => {
            result.message = 'Adding producer was unsuccessful';
            result.success = false;
            result.error = error;
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      let result = {};
      result.message = 'Producer name must be in the request body';
      result.success = false;
      result.error = error;
      return response.status(400).send(result);
    }
  }

  removeProducer(request, response) {
    let movieObject = {
      movieId: request.params.movieId,
      producer: null,
    };
    let result = {};
    return new Promise((resolve, reject) => {
      movieService
        .removeProducer({ _id: movieObject.movieId }, { producer: null })
        .then((data) => {
          result.message = 'Removed Producer from movie';
          result.success = true;
          result.data = data;
          return response.status(200).send(result);
        })
        .catch((error) => {
          result.message = 'Producer from movie was not removed';
          result.success = false;
          result.error = error;
          return response.status(500).send(result);
        });
    });
  }

  editMovie(request, response) {
    try {
      logger.info('Inside cntroller');
      if (
        request.body.name === undefined ||
        request.body.yearOfRelease === undefined ||
        request.body.plot === undefined
      )
        throw 'Request body cannot be undefined';
      if (
        request.body.name === null ||
        request.body.yearOfRelease === null ||
        request.body.plot === null
      )
        throw 'Request body cannot be null';

      request
        .check('yearOfRelease', 'Year Of Release must be numberis')
        .isNumeric();
      request
        .check('yearOfRelease', 'Year should be in year format')
        .matches(/^[0-9]{4}$/);
      // request.check('plot', 'Plot must be character string').isAlpha();

      let errors = request.validationErrors();
      let result = {};
      let count = 0;
      let createActorObject = {};
      if (errors) {
        logger.error('error=====================>', errors);
        result.success = false;
        result.message = 'Validation Error';
        result.error = errors[0].msg;
        return response.status(400).send(result);
      } else {
        logger.info('inside else');
        let editObject = {
          name: request.body.name,
          yearOfRelease: request.body.yearOfRelease,
          plot: request.body.plot,
        };
        let idObject = {
          movieId: request.params.movieId,
        };

        movieService
          .editDetails(idObject, editObject)
          .then((reply) => {
            let editProducer = {
              name: request.body.producer.name,
              sex: request.body.producer.sex,
              dob: request.body.producer.dob,
              bio: request.body.producer.bio,
            };

            // logger.info('data after editing movie details');

            producerService
              .create(editProducer)
              .then((data) => {
                // logger.info('data after editing producer details');
                movieModel
                  .update({ _id: reply._id }, { producer: data._id })
                  .then((data) => {
                    logger.info('length' + Object.keys(request.body.actors).length);
                    if (Object.keys(request.body.actors).length !== 0) {
                      request.body.actors.forEach((element) => {
                        createActorObject = {
                          name: element.name,
                          sex: element.sex,
                          dob: element.dob,
                          bio: element.bio,
                        };
                        actorService
                          .addActor(createActorObject)
                          .then((data) => {
                            logger.info('after ediitng actors' + data);
                            movieService
                              .addActorInMovie({ _id: data._id }, idObject)
                              .then((data) => {
                                count++;
                                // eslint-disable-next-line prettier/prettier
                                if (count === Object.keys(request.body.actors).length) {
                                  result.data = data;
                                  result.success = true;
                                  result.message =
                                    'Movie details have been edited successfully';
                                  return response.status(200).send(result);
                                }
                              })
                              .catch((error) => {
                                // eslint-disable-next-line prettier/prettier
                                if (
                                  count ===
                                  Object.keys(request.body.actors).length
                                ) {
                                  logger.error('error------->' + error);
                                  result.error = error;
                                  result.success = false;
                                  result.message =
                                    "Request couldn't completely be processed";
                                  return response.status(400).send(result);
                                }
                              });
                          })
                          .catch((error) => {
                            result.error = error;
                            result.success = false;
                            result.message = 'Editting actors was unsuccessful';
                            return response.status(500).send(result);
                          });
                      });
                    } else {
                      movieModel
                        .update({ _id: idObject.movieId }, { actors: [] })
                        .then((data) => {
                          result.success = true;
                          result.message =
                            'Successful editing of movie details';
                          result.data = data;
                          return response.status(200).send(result);
                        })
                        .catch((error) => {
                          result.message =
                            'Unsuccessful editing of movie details';
                          result.success = false;
                          result.error = error;
                          return response.status(500).send(result);
                        });
                    }
                  })
                  .catch((error) => {
                    result.success = false;
                    result.message =
                      'Error Occurred by saving producer id in movies data';
                    result.error = error;
                    return response.status(500).send(result);
                  });
              })
              .catch((error) => {
                logger.error('----------------------->', error);
                result.success = false;
                result.message = 'Editing producer details was unsuccessful';
                result.error = error;
                return response.status(500).send(result);
              });
          })
          .catch((error) => {
            result.success = false;
            result.message = 'Editing movie details was unsuccessful';
            result.error = error;
            return response.status(500).send(result);
          });
      }
    } catch (error) {
      let result = {};
      result.success = false;
      result.message = 'Request body should contain all entities';
      result.error = error;
      return response.status(400).send(result);
    }
  }

  getMovie(request, response) {
    let result = {};
    let idObject = {
      _id: request.params.movieId,
    };
    movieService
      .getMovie(idObject)
      .then((data) => {
        if (data !== null) {
          result.success = true;
          result.message = 'Successfull got all movies';
          result.data = data;
          return response.status(200).send(result);
        } else {
          result.success = true;
          result.message = 'No data found';
          result.data = data;
          return response.status(404).send(result);
        }
      })
      .catch((error) => {
        result.success = false;
        result.message = 'Unable to get all movies';
        result.error = error;
        return response.status(500).send(error);
      });
  }
}

module.exports = new MovieController();
