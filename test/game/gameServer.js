import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import chai from 'chai';
import app from '../../server';

const {
  expect
} = chai;

const gameData = {
  gameID: 1,
  gamePlayers: ['micheal', 'racheal', 'ejiro'],
  gameRound: 7,
  gameWinner: 'micheal'
};
const server = supertest(app);
const signupUrl = '/api/auth/signup';
const gameUrl = `/api/v1/games/${gameData.gameID}/start`;
let token; // store token for user authentication
const expiredToken = jwt.sign({
  _id: 'h123h1h2hhhhhhs'
}, 'expired', {
  expiresIn: '0.001s'
});

const User = mongoose.model('User');
const Game = mongoose.model('Game');
// delete all records in User model
User.collection.drop();
// delete all records in Game model
Game.collection.drop();
const userDetails = {
  name: 'tester',
  email: 'tester@gmail.com',
  password: 'werokajksjkfd',
};

describe('Create game using authenticated route', () => {
  before((done) => {
    server
      .post(signupUrl)
      .send(userDetails)
      .end((err, res) => {
        if (err) return done(err);
        const userToken = res.body.userDetails.token;
        token = userToken;
        done();
      });
  });
  it(
    'should return 201 status code and game winner for successfully creating a game log',
    (done) => {
      server
        .post(gameUrl)
        .set('Connection', 'keep alive')
        .set('Accept', 'application/json')
        .set('x-token', token)
        .set('Content-Type', 'application/json')
        .type('form')
        .send(gameData)
        .end((err, res) => {
          expect(res.body.message).to.equal('Game successfully logged');
          expect(res.body.gameLog.gameWinner).to.equal(gameData.gameWinner);
          expect(res.status).to.equal(201);
          if (err) return done(err);
          done();
        });
    }
  );

  it(
    'should return error message and not create a game when token is not provided',
    (done) => {
      server
        .post(gameUrl)
        .set('Accept', 'application/json')
        .set('x-token', '')
        .type('form')
        .send(gameData)
        .end((err, res) => {
          expect(res.body.message).to.equal('Token not provided');
          expect(res.status).to.equal(401);
          if (err) return done(err);
          done();
        });
    }
  );

  it(
    'should return error message and not create a game when token is expired',
    (done) => {
      server
        .post(gameUrl)
        .set('Accept', 'application/json')
        .set('x-token', expiredToken)
        .type('form')
        .send(gameData)
        .end((err, res) => {
          expect(res.body.message).to.equal('Expired token');
          expect(res.status).to.equal(401);
          if (err) return done(err);
          done();
        });
    }
  );
});
