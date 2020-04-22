/**
 * @description This is the file where all the request come first.
 * @file        server.js
 * @author      Sindooja Gajam
 * @version     node v12.16.1
 * @since       31 March 2020
 */

/**
 * @const       express    Express constant having the `express` module
 * @const       bodyParser Bodyparser constant having the `body-parser` module
 * @const       mongoose   Mongoose constant having the `mongoose` module
 * @const       app        App constant having the `express()`
 */
const express = require("express");
const validator = require("express-validator");
const bodyparser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const mongoose = require("./config/database.config");
const route = require("./routes/route");
const logger = require("./config/winston");
const swaggerDocument = require("./swagger");
require("dotenv/").config();

const app = express();

const port = process.env.PORT;

app.use(cors());
app.use("/imdb", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyparser.json());
app.use(validator());
app.use("/", route);

app.listen(port, () => {
  mongoose.connect();
  logger.info(`Server is listening on ${port}`);
});
