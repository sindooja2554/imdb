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

const express = require("express");
const multer = require("multer");

const routes = express.Router();
const actor = require("../controller/actors");
const movie = require("../controller/movies");
const producer = require("../controller/producers");

const upload = multer({ dest: "uploads/" });

// Routes for actors
routes.post("/actor", actor.addActor);
routes.get("/actor", actor.getAllActor);
routes.delete("/actor/:actorId", actor.delete);
routes.put("/actor/:actorId", actor.update);

// Routes for movies
routes.post("/addmovie", movie.addMovie);
routes.post("/addactor/:movieId", movie.addActorInMovie);
routes.post("/removeactor/:movieId", movie.removeActorFromMovie);
routes.post("/addproducer/:movieId", movie.addProducer);
routes.post("/removeproducer/:movieId", movie.removeProducer);
routes.post("/movieposter/:movieId", upload.single("image"), movie.moviePoster);
routes.get("/movie", movie.getAllMovies);
routes.get("/movie/:movieId", movie.getMovie);
routes.delete("/movie/:movieId", movie.delete);
routes.put("/movie/:movieId", movie.editMovie);

// Routes for producers
routes.post("/producer", producer.create);
routes.get("/producer", producer.getAllProducers);
routes.get("/producer/:producerId", producer.findOne);
routes.delete("/producer/:producerId", producer.delete);
routes.put("/producer/:producerId", producer.update);

module.exports = routes;
