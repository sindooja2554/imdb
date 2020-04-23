/**
 * @description This file contains service class.
 * @file        services.note.js
 * @overview    The service class gives call to API class according to the request.
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       02 April 2020
 */

const movieModel = require("../app/model/movies");
const actorService = require("./actors");
const producerModel = require("../app/model/producers");
const logger = require("../config/winston");

class MovieServices {
  addMovie(request) {
    return new Promise((resolve, reject) => {
      movieModel.findOne({ name: request.name }).then((data) => {
        if (
          (data !== null && data.yearOfRelease !== request.yearOfRelease) ||
          data === null
        ) {
          movieModel
            .create(request)
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              return reject(error);
            });
        } else {
          return resolve("Movie data already exists");
        }
      });
    });
  }

  addActorInMovie(request, movieObject) {
    return new Promise((resolve, reject) => {
      actorService.findOne({ name: request.actorName }).then((data) => {
        if (data !== null) {
          movieModel
            .update(
              { _id: movieObject.movieId },
              { $push: { actors: data._id } }
            )
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              return reject(error);
            });
        }
      });
    });
  }

  removeActorFromMovie(request, editObject) {
    return new Promise((resolve, reject) => {
      movieModel.findOne(request).then((data) => {
        if (data !== null) {
          if (Object.keys(data.actors).length !== 0) {
            for (let i = 0; i < Object.keys(data.actors).length; i++) {
              if (
                JSON.stringify(data.actors[i]) ===
                JSON.stringify(editObject.actorId)
              ) {
                data.actors.splice(i, 1);
                movieModel
                  .update({ _id: data._id }, { actors: data.actors })
                  .then((data) => {
                    return resolve(data);
                  })
                  .catch((error) => {
                    return reject(error);
                  });
              }
            }
          }
        } else {
          return reject(data);
        }
      });
    }).catch((error) => {
      logger.error("error----------->" + error);
    });
  }

  getAllMovies() {
    return new Promise((resolev, reject) => {
      movieModel
        .findAll()
        .then((data) => {
          return resolev(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  moviePoster(request) {
    return new Promise((resolve, reject) => {
      movieModel
        .findOne({ _id: request.id })
        .then((data) => {
          if (data !== null) {
            logger.info("request in service" + JSON.stringify(request));
            movieModel
              .update({ _id: data._id }, { poster: request.imageUrl })
              .then((data) => {
                return resolve(data);
              })
              .catch((error) => {
                return reject(error);
              });
          } else {
            return reject("No data Found");
          }
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  async delete(request) {
    let data = await movieModel.delete(request);
    return data;
  }

  editDetails(idObject, editObject) {
    return new Promise((resolve, reject) => {
      movieModel.findOne({ _id: idObject.movieId }).then((data) => {
        if (data !== null) {
          let movie = {
            name: editObject.name ? editObject.name : data.name,
            yearOfRelease: editObject.yearOfRelease
              ? editObject.yearOfRelease
              : data.yearOfRelease,
            plot: editObject.plot ? editObject.plot : data.plot,
            // "producer": editObject.producerId ? editObject.producerId : data.producer
          };

          movieModel
            .update({ _id: idObject.movieId }, movie)
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              return reject(error);
            });
        }
      });
    });
  }

  addProducer(request) {
    return new Promise((resolve, reject) => {
      producerModel.findOne({ name: request.producerName }).then((data) => {
        movieModel
          .update({ _id: request.movieId }, { producer: data._id })
          .then((data) => {
            return resolve(data);
          })
          .catch((error) => {
            return reject(error);
          });
      });
    });
  }

  removeProducer(idObject, editObject) {
    return new Promise((resolve, reject) => {
      movieModel
        .update(idObject, editObject)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  getMovie(idObject) {
    return new Promise((resolve, reject) => {
      movieModel
        .findOne({ _id: idObject._id })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
}

module.exports = new MovieServices();
