/**
 * @description This file contains API class.
 * @file        app.model.movies.js
 * @overview    The API function take in request and perform the operation and sends back
 *              response to the service file
 * @author      Sindooja Gajam
 * @version     node v12.10.0
 * @since       02 April 2020
 */

/**
 * @const       mongoose Mongoose constant having the `mongoose` module
 */

const mongoose = require("mongoose");

const schema = mongoose.Schema;

const movieSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    yearOfRelease: {
      type: Number,
      required: true,
    },
    plot: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: "",
    },
    actors: [
      {
        type: schema.Types.ObjectId,
        ref: "Actor",
        default: [],
      },
    ],
    producer: {
      type: schema.Types.ObjectId,
      ref: "Producer",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

let Movie = mongoose.model("Movie", movieSchema);

class MovieApi {
  /**
   * @param {object} request
   * @description This api is use to add new movie details in the movie's database using mongoose query
   * @function create
   */
  create(request) {
    let addMovie = new Movie({
      name: request.name,
      yearOfRelease: request.yearOfRelease,
      plot: request.plot,
      producer: request.producer,
      actors: request.actors || [],
    });
    // logger.info
    return new Promise((resolve, reject) => {
      addMovie
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
   * @param {object} request
   * @description This api is use to get particular movie's information from movie's database using mongoose query
   * @function findOne
   */
  findOne(request) {
    return new Promise((resolve, reject) => {
      Movie.findOne(request)
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @param {object} movieId
   * @param {object} dataToUpdate
   * @description This api is use to update information about a movie in the movie's database using mongoose query
   * @function update
   */
  update(movieId, dataToUpdate) {
    return new Promise((resolve, reject) => {
      Movie.findByIdAndUpdate(movieId, dataToUpdate, { new: true })
        .then((data) => {
          return resolve(data);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  /**
   * @description This api is use to get all the movie's information from movie's database using mongoose query
   * @function findAll
   */
  async findAll() {
    let data = await Movie.find().populate("actors").populate("producer");
    return data;
  }

  /**
   * @param {object} request
   * @description This api is use to delete particular movie from the movie's database using mongoose query
   * @function delete
   */
  async delete(request) {
    let data = await Movie.findByIdAndDelete(request);
    return data;
  }
}

module.exports = new MovieApi();
