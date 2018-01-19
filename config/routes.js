import { requiresLogin } from './middlewares/authorization';
import saveGameLogs from '../app/controllers/game';
import {
  authCallback,
  signin,
  signup,
  signout,
  session,
  checkAvatar,
  avatar,
  create,
  searchUser,
  inviteUser,
  login,
  addDonation,
  show,
  me,
  user,
} from '../app/controllers/users';

const answers = require('../app/controllers/answers');
const questions = require('../app/controllers/questions');
const avatars = require('../app/controllers/avatars');
const index = require('../app/controllers/index');

module.exports = (app, passport) => {
  // User Routes
  app.get('/signin', signin);
  app.get('/signup', signup);
  app.get('/chooseavatars', checkAvatar);
  app.get('/signout', signout);


  // Setting up the users api
  app.post('/api/auth/signup', create);
  app.post('/users/avatars', avatar);
  app.post('/api/auth/login', login);
  app.get('/api/search', searchUser);
  app.post('/api/users/invite', inviteUser);

  // Donation Routes
  app.post('/donations', addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), session);

  app.get('/users/me', me);
  app.get('/users/:userId', show);

  // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), authCallback);

  // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), authCallback);

  // Finish with setting up the userId param
  app.param('userId', user);

  // Answer Routes

  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
  // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

  // Question Routes

  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
  // Finish with setting up the questionId param
  app.param('questionId', questions.question);

  // Avatar Routes

  app.get('/avatars', avatars.allJSON);

  //  Home route
  app.get('/play', index.play);
  app.get('/', index.render);
  // Game route
  app.post('/api/v1/games/:id/start', requiresLogin, saveGameLogs);
};
