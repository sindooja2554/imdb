/**
 * @description This file contains users class.
 * @file        app.model.user.js
 * @overview    The API function take in request and perform the operation and sends back
 *              response to the service file
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       25 April 2020
 */

/**
 * @const       mongoose Mongoose constant having the `mongoose` module
 */

const mongoose = require('mongoose');
let logger = require('../../config/winston');

const schema = mongoose.Schema;

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    longUrl: {
      type: String,
      default: null,
    },
    shortUrl: {
      type: String,
      default: null,
    },
    urlCode: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    watchList: [
      {
        type: schema.Types.ObjectId,
        ref: 'Movie',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

let User = mongoose.model('User', UserSchema);

class Users {
  /**
   * @description This function takes in request and using mongoose query sends back
   *              the response.
   * @function    findOne
   * @param {*}   request
   * @param {*}   callback
   */
  findOne(request, callback) {
    User.findOne(request).exec(function(error, data) {
      if (error) {
        return callback('Error while finding user');
      } else if (data === null) {
        return callback(error, null);
      } else {
        User.populate(data, {"path" : "watchList"}, (error,data)=>{
          if(error) {
            return callback(error);
          }else {
            return callback(null, data);
          }
        })
      }
    });
  }

  /**
   * @description This function takes in request and using mongoose query update the
   *              fields in the database
   * @param {*}   request
   * @param {*}   dataToUpdate
   * @param {*}   callback
   */
  updateOne(request, dataToUpdate) {
    return new Promise(function (resolve, reject) {
      User.findOneAndUpdate(request, dataToUpdate, { new: true })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @description This function takes in request as a parameter and save the object
   *              in the database.
   * @param {*} request
   */
  create(request) {
    // console.log("in model");

    let createUser = new User({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: request.password,
    });
    return new Promise(function (resolve, reject) {
      createUser
        .save()
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

module.exports = new Users();
