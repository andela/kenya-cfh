import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const rootPath = path.normalize(`${__dirname}/../..`);

const testDb = process.env.MONGOHQ_TEST;
const prodDB = process.env.MONGOHQ_URL;

const database = (process.env.NODE_ENV === 'test') ? testDb : prodDB;

export default {
  root: rootPath,
  expressKey: process.env.EXPRESS,
  port: process.env.PORT || 3000,
  db: database,
  secret: process.env.SECRET
};
