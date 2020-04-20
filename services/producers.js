/**
 * @description This file contains service class.
 * @file        services.label.js
 * @overview    The service class gives call to API class according to the request.
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       03 April 2020
 */

let producerModel = require("../app/model/producers");
let movieModel = require("../app/model/movies");
let logger = require("../config/winston");

class ProducerServices {
  create(request) {
    return new Promise((resolve, reject) => {
      producerModel
        .findOne({ name: request.name })
        .then((data) => {
          logger.info("data from findone " + JSON.stringify(data));
          if (data === null) {
            producerModel
              .create(request)
              .then((data) => {
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

  async getAllProducers(request) {
    let data = await producerModel.findAll();
    return data;
  }

  delete(request) {
    return new Promise((resolve, reject) => {
      producerModel
        .delete({ _id: request._id })
        .then((data) => {
          if (data !== null) {
            movieModel
              .findOne({ producer: data._id })
              .then((reply) => {
                if (reply !== null) {
                  movieModel
                    .update({ _id: reply._id }, { producer: null })
                    .then((reply) => {
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
          } else {
            return resolve(data);
          }
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  findOne(request) {
    return new Promise((resolve, reject) => {
      producerModel
        .findOne({ _id: request._id })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  update(idObject, request) {
    return new Promise((resolve, reject) => {
      producerModel.findOne(idObject).then((data) => {
        if (data !== null) {
          let producer = {
            name: request.name ? request.name : data.name,
            sex: request.sex ? request.sex : data.sex,
            dob: request.dob ? request.dob : data.dob,
            bio: request.bio ? request.bio : data.bio,
          };
          logger.info("calling model Update");
          producerModel
            .update({ _id: data._id }, producer)
            .then((data) => {
              return resolve(data);
            })
            .catch((error) => {
              return reject(error);
            });
        } else {
          let producer = {};
          producer.name = request.name;
          producer.sex = request.sex;
          producer.bio = request.bio;
          producer.dob = request.dob;
          producerModel
            .create(producer)
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

module.exports = new ProducerServices();
