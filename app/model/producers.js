/**
 * @description This file contains API class.
 * @file        app.model.producers.js
 * @overview    The API function take in request and perform the operation and sends back
 *              response to the service file
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       03 April 2020
 */

/**
 * @const       mongoose Mongoose constant having the `mongoose` module
 */

const mongoose = require("mongoose");

const schema = mongoose.Schema;

const producerSchema = mongoose.Schema(
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

let Producer = mongoose.model("Producer", producerSchema);

class ProducerApi {
  /**
   * @param {object} request
   * @description This api is use to add new producer's details in the producer's database using mongoose query
   * @function create
   */
  create(request) {
    let addProducer = new Producer({
      name: request.name,
      sex: request.sex,
      dob: request.dob,
      bio: request.bio,
    });

    return new Promise(function (resolve, reject) {
      addProducer
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
   * @description This api is use to get all the producer's information from producer's database using mongoose query
   * @function findAll
   */
  async findAll() {
    let data = await Producer.find();
    return data;
  }

  /**
   * @param {object} request
   * @description This api is use to delete particular producer from the producer's database using mongoose query
   * @function delete
   */
  delete(request) {
    return new Promise((resolve, reject) => {
      Producer.findByIdAndDelete(request)
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
   * @description This api is use to get particular producer's information from producer's database using mongoose query
   * @function findOne
   */
  findOne(request) {
    return new Promise((resolve, reject) => {
      Producer.findOne(request)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @param {object} producerId
   * @param {object} dataToUpdate
   * @description This api is use to update information about a producer in the producer's database using mongoose query
   * @function update
   */
  update(producerId, dataToUpdate) {
    return new Promise((resolve, reject) => {
      Producer.findByIdAndUpdate(producerId, dataToUpdate, { new: true })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }
}

module.exports = new ProducerApi();
