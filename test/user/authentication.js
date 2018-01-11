import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../server';

const server = supertest(app);
const signupURL = '/api/auth/signup';
let dummyUser;

describe('Signup API', () => {
  beforeEach(() => {
    dummyUser = {
      name: 'dummy',
      email: 'dummy@gmail.com',
      password: 'werokajksjkfd',
    };
  });
  it('Should signup a user and return a token', (done) => {
    server.post(signupURL)
      .set('Connection', 'keep alive')
      .set('Content-Type', 'application/json')
      .type('form')
      .send(dummyUser)
      .end((err, res) => {
        expect(res.statusCode).to.equal(201);
        done();
      });
  });
  it(
    'Should return a 400 when a user tries to signup without a name',
    (done) => {
      const testUser = Object.assign({}, dummyUser);
      delete testUser.name;
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Content-Type', 'application-json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
    }
  );
  it(
    'Should return a 400 when a user tries to signup without an email',
    (done) => {
      const testUser = Object.assign({}, dummyUser);
      delete testUser.email;
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Content-Type', 'application/json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
    }
  );
  it(
    'Should return a 400 when a user tries to signup without a password',
    (done) => {
      const testUser = Object.assign({}, dummyUser);
      delete testUser.password;
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Content-Type', 'application/json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
    }
  );
  it(
    'Should return a 400 when password length is less than 8 characters',
    (done) => {
      const testUser = Object.assign({}, dummyUser);
      testUser.password = 'jdksd';
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Content-Type', 'application/json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
    }
  );
});
