import underscore from 'underscore';
import config from './env/all';

const path = `${__dirname}/../config/env/${process.env.NODE_ENV}.js`;
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const env = require(`${path}`) || {};

// Load app configuration
export default underscore.extend(
  config,
  env
);
