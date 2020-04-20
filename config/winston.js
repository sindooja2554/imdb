/**
 * @description To set up and configure winston logger
 * @file        winston.js
 * @overview    To save the log's in transport
 * @author      Sindooja Gajam
 * @version     winston "^3.2.1"
 * @since       18 April 2020
 */

/**
 * @constant winston  Winston constant is having the winston module
 */

const winston = require("winston");

// define the custom settings for each transport (file, console)
let options = {
  file: {
    level: "info",
    filename: `./logs/app.log`,
    handleExceptions: true,
    json: true,
    maxSize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
let logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;
