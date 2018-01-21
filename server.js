import dotenv from 'dotenv';
import config from './config/config';
import expressConfig from './config/express';

dotenv.config();

/**
 * Module dependencies.
 */
const express = require('express'),
  fs = require('fs'),
  passport = require('passport'),
  logger = require('mean-logger'),
  io = require('socket.io');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
const env = process.env.NODE_ENV || 'development',
  auth = require('./config/middlewares/authorization'),
  mongoose = require('mongoose');

// Bootstrap db connection
const db = mongoose.connect(config.db, {
  useMongoClient: true
});

// Bootstrap models
const modelsPath = __dirname + '/app/models';
const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = path + '/' + file;
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};
walk(modelsPath);

// bootstrap passport config
require('./config/passport')(passport);

const app = express();

app.use((req, res, next) => {
  next();
});

// express settings
expressConfig(app, passport, mongoose);

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
const { port } = config;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);


// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
