import { expect } from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';

const server = supertest(app);
const signupURL = '/api/auth/signup';
const signinURL = '/api/auth/login';
let dummyUser;

after((done) => {
  mongoose.connection.db.dropDatabase(done);
});

describe('USER AUTHENTICATION TESTS', () => {
  beforeEach(() => {
    dummyUser = {
      name: 'dummy',
      email: 'dummy@gmail.com',
      password: 'werokajksjkfd',
    };
  });
  describe('Signup API', () => {
    it('Should signup a user and return a token', (done) => {
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Content-Type', 'application/json')
        .type('form')
        .send(dummyUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body.userDetails.token).to.be.a('string');
          expect(res.body.userDetails.name).to.be.a('string');
          expect(res.body.userDetails.email).to.be.a('string');
          expect(res.body.userDetails.name).to.equal('dummy');
          expect(res.body.userDetails.email).to.equal('dummy@gmail.com');
          done();
        });
    });
    it(
      'Should return a 400 when a user tries to signup without a name',
      (done) => {
        const testUser = { ...dummyUser };
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
      'Should return an error message when a user tries to signup without a name',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.name;
        server.post(signupURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.name).to.equal('Name is required.');
            done();
          });
      }
    );
    it(
      'Should return a 400 when a user tries to signup without an email',
      (done) => {
        const testUser = { ...dummyUser };
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
      'Should return an error message when a user tries to signup without a email',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.email;
        server.post(signupURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.email).to.equal('Please provide a valid email address.');
            done();
          });
      }
    );
    it(
      'Should return a 400 when a user tries to signup without a password',
      (done) => {
        const testUser = { ...dummyUser };
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
      'Should return an error message when a user tries to signup without a password',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.password;
        server.post(signupURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.password).to
              .equal('Please provide a password greater than 8 characters.');
            done();
          });
      }
    );

    it(
      'Should return a 400 when password length is less than 8 characters',
      (done) => {
        const testUser = { ...dummyUser };
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
    it(
      'Should return an error message when a user tries to signup with a password less than 8 characters',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.password;
        server.post(signupURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.password).to
              .equal('Please provide a password greater than 8 characters.');
            done();
          });
      }
    );
  });

  describe('Sign In API', () => {
    dummyUser = {
      name: 'dummyname',
      email: 'dummy@gmail.com',
      password: 'qwertyuiop',
    };
    before((done) => {
      server.post(signupURL)
        .set('Connection', 'keep alive')
        .set('Connection', 'application/json')
        .type('form')
        .send(dummyUser)
        .end((done));
    });
    it('Should sign in a user and return a token', (done) => {
      server.post(signinURL)
        .set('Connection', 'keep alive')
        .set('Connection', 'application/json')
        .type('form')
        .send(dummyUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.status).to.equal('OK');
          expect(res.body.userDetails.token).to.be.a('string');
          expect(res.body.userDetails.email).to.be.a('string');
          expect(res.body.userDetails.email).to.equal('dummy@gmail.com');
          expect(res.body.userDetails.name).to.equal('dummy');
          done();
        });
    });
    it('Should return 401 and an error message when a user attempts to sign in with an invalid email', (done) => {
      const testUser = { ...dummyUser };
      testUser.email = 'hfsjdfhjf@gmail.com';
      server.post(signinURL)
        .set('Connection', 'keep alive')
        .set('Connection', 'application/json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body.status).to.equal('Error');
          expect(res.body.message).to.equal('Invalid email or password');
          done();
        });
    });
    it(
      'Should return an error message when a user tries to signin without an email',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.email;
        server.post(signinURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.email).to.equal('Input an email address to sign-in.');
            done();
          });
      }
    );
    it('Should return a 401 and an error message when a user attempts to sign in with an invalid password', (done) => {
      const testUser = { ...dummyUser };
      testUser.password = 'mcnvjfjkfkdkss';
      server.post(signinURL)
        .set('Connection', 'keep alive')
        .set('Connection', 'application/json')
        .type('form')
        .send(testUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body.status).to.equal('Error');
          expect(res.body.message).to.equal('Invalid email or password');
          done();
        });
    });
    it(
      'Should return an error message when a user tries to signin without an password',
      (done) => {
        const testUser = { ...dummyUser };
        delete testUser.password;
        server.post(signinURL)
          .set('Connection', 'keep alive')
          .set('Content-Type', 'application-json')
          .type('form')
          .send(testUser)
          .end((err, res) => {
            expect(res.body.password).to.equal('Input a password to sign-in.');
            done();
          });
      }
    );
  });
});
