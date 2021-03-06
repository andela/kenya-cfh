/**
 * Module dependencies.
 */
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import passport from 'passport';
import logger from 'mean-logger';
import io from 'socket.io';

import config from './config/config';
import expressConfig from './config/express';
import router from './config/routes';
import passportConfig from './config/passport';
import socketConfig from './config/socket/socket';

dotenv.config();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');

// Bootstrap db connection
mongoose.connect(config.db, {
  useMongoClient: true
});

// Bootstrap models
const modelsPath = `${__dirname}/app/models`;
const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = `${path}/${file}`;
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      /* eslint-disable import/no-dynamic-require */
      /* eslint-disable global-require */
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
passportConfig(passport);

const app = express();

app.use((req, res, next) => {
  next();
});

// express settings
expressConfig(app, passport, mongoose);

// Bootstrap routes
router(app, passport, auth);

// Start the app by listening on <port>
const { port } = config;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
socketConfig(ioObj);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
