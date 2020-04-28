/**
 * @description This file contains API class.
 * @file        app.model.actors.js
 * @overview    The API function take in request and perform the operation and sends back
 *              response to the service file
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       01 April 2020
 */

/**
 * @const       mongoose Mongoose constant having the `mongoose` module
 */

const mongoose = require('mongoose');

const actorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sex: {
      type: String,
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

let Actor = mongoose.model('Actor', actorSchema);

class ActorApi {
  /**
   * @param {object} request
   * @description This api is use to add new actor in the actor's database using mongoose query
   * @function add
   */
  add(request) {
    let addActor = new Actor({
      name: request.name,
      sex: request.sex,
      dob: request.dob,
      bio: request.bio,
    });
    return new Promise(function (resolve, reject) {
      addActor
        .save()
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @description This api is use to get all the actor's information from actor's database using mongoose query
   * @function getAll
   */
  getAll() {
    return new Promise(function (resolve, reject) {
      Actor.find()
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @param {object} request
   * @description This api is use to get particular actor's information from actor's database using mongoose query
   * @function findOne
   */
  findOne(request) {
    return new Promise((resolve, reject) => {
      Actor.findOne(request)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @param {object} request
   * @description This api is use to delete particular actor from the actor's database using mongoose query
   * @function delete
   */
  delete(request) {
    return new Promise((resolve, reject) => {
      Actor.findByIdAndDelete(request)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @param {object} actorId
   * @param {object} dataToUpdate
   * @description This api is use to update information about an actor in the actor's database using mongoose query
   * @function update
   */
  update(actorId, dataToUpdate) {
    return new Promise((resolve, reject) => {
      Actor.findByIdAndUpdate(actorId, dataToUpdate, { new: true })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
}

module.exports = new ActorApi();
