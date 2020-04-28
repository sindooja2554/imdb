/**
 * @description This file contains service class.
 * @file        services.actors.js
 * @overview    The service class gives call to API class according to the request.
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       01 April 2020
 */

const actorModel = require('../app/model/actors');
const movieservice = require('./movies');
const logger = require('../config/winston');

class Services {
  addActor(request) {
    logger.info('inside create service');
    return new Promise(function (resolve, reject) {
      actorModel.findOne({ name: request.name }).then((data) => {
        if (data === null) {
          logger.info('in if');
          actorModel
            .add(request)
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              logger.error('in error', error);
              return reject(error);
            });
        } else {
          logger.info('---------------->', data);
          return resolve(data); // Already exist
        }
      });
    });
  }

  getAllActors() {
    return new Promise(function (resolve, reject) {
      actorModel
        .getAll()
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  findOne(request) {
    return new Promise((resolve, reject) => {
      logger.info('inside findOne');
      actorModel
        .findOne({ name: request.name })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  delete(request) {
    return new Promise((resolve, reject) => {
      actorModel
        .delete(request)
        .then((data) => {
          let editObject = {};
          if (data !== null) {
            editObject = {
              actorId: data._id,
            };
            movieservice
              .removeActorFromMovie({ actors: data._id }, editObject)
              .then((reply) => {
                logger.info('response--------------->', reply);
                return resolve(data);
              })
              .catch((error) => {
                return reject(error);
              });
          } else {
            return resolve(data);
          }
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  update(idObject, request) {
    return new Promise((resolve, reject) => {
      actorModel.findOne(idObject).then((data) => {
        if (data !== null) {
          let actor = {
            name: request.name ? request.name : data.name,
            sex: request.sex ? request.sex : data.sex,
            dob: request.dob ? request.dob : data.dob,
            bio: request.bio ? request.bio : data.bio,
          };
          logger.info('calling model Update');
          actorModel
            .update({ _id: data._id }, actor)
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              return reject(error);
            });
        } else {
          let actor = {};
          actor.name = request.name;
          actor.sex = request.sex;
          actor.dob = request.dob;
          actor.bio = request.bio;
          actorModel
            .add(actor)
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
}

module.exports = new Services();
