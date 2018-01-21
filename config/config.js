import underscore from 'underscore';
import config from './env/all';

const env = require(__dirname
  + '/../config/env/' + process.env.NODE_ENV + '.json') || {};

// Load app configuration
export default underscore.extend(
  config,
  env
);
