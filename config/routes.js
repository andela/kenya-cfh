import {
  authCallback,
  signin,
  signup,
  signout,
  session,
  checkAvatar,
  avatar,
  create,
  login,
  searchUser,
  inviteUser,
  addDonation,
  show,
  me,
  user,
  getDonation
} from '../app/controllers/users';
import { requiresLogin } from './middlewares/authorization';
import {
  saveGameLogs,
  getGameLog,
  getLeaderboard } from '../app/controllers/game';
import answers from '../app/controllers/answers';
import { question, showQuestion, all } from '../app/controllers/questions';
import avatars from '../app/controllers/avatars';
import index from '../app/controllers/index';

export default (app, passport) => {
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
  app.get('/api/v1/donations', requiresLogin, getDonation);

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

  app.get('/questions', all);
  app.get('/questions/:questionId', showQuestion);
  // Finish with setting up the questionId param
  app.param('questionId', question);

  // Avatar Routes

  app.get('/avatars', avatars.allJSON);

  //  Home route
  app.get('/play', index.play);
  app.get('/', index.render);

  // Game route
  app.post('/api/v1/games/:id/start', requiresLogin, saveGameLogs);
  app.get('/api/v1/games/history', requiresLogin, getGameLog);
  app.get('/api/v1/games/leaderboard', getLeaderboard);
};
