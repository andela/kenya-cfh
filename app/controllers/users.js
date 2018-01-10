import jwt from 'jsonwebtoken';
import validateSignup from '../validators/signupValidator';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  User = mongoose.model('User');
const avatars = require('./avatars').all();

/**
 * Auth callback
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Redirect user after picking an avatar
 */
exports.authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Redirect user after signin
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 * function to check if a user is signed in already
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Redirect to the signup page
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 * function to redirect to the homepage on signout
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Redirect to the homepage
 */
exports.signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 * Function that monitors sessions
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Redirect to the homepage
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Assigns an avatar to a user
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/choose-avatar');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Create user
 * Function that creates a user and assigns a token to them
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} The created user and their assigned token
 */
exports.create = (req, res) => {
  const { errors, valid } = validateSignup(req.body);
  if (!valid) {
    return res.status(400).json(errors);
  }

  User.findOne({
    email: req.body.email,
  }).then((foundUser) => {
    if (foundUser) {
      return res.redirect('/#!/signup?error=existinguser');
    }
    const user = new User(req.body);
    user.avatar = avatars[user.avatar];
    user.provider = 'local';
    user.save((err) => {
      if (err) {
        return res.status(500).json({
          status: 'Error',
          message: err.errors,
        });
      }
      req.logIn(user, (err, next) => {
        if (err) return next(err);
        const token = jwt.sign(
          {
            id: user._id,
          },
          'somesecretkeyhere', { expiresIn: '30 days' }
        );
        return res.status(201).json({
          status: 'Success',
          message: 'Registration Successful',
          data: {
            token
          }
        });
      });
    });
  })
    .catch(error => res.status(500).json({ err: error.message }));
};

/**
 * Assign avatar to user
 * Function to assign an avatar to a user
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} the updated user profile
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        user.avatar = avatars[req.body.avatar];
        user.save();
      });
  }
  return res.redirect('/#!/app');
};

exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount &&
      req.body.crowdrise_donation_id &&
      req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
        .exec((err, user) => {
        // Confirm that this object hasn't already been entered
          let duplicate = false;
          for (let i = 0; i < user.donations.length; i += 1) {
            if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            console.log('Validated donation');
            user.donations.push(req.body);
            user.premium = 1;
            user.save();
          }
        });
    }
  }
  res.send();
};

/**
 *  Show profile
 * Function to show user profile
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {any} Redirect the user to their profile
 */
exports.show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 * Function to return the user details
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @returns {func} Returns the user details
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 * Function to find a user
 * @param {any} req - the request object
 * @param {any} res - the response object
 * @param {callback} next - callback function
 * @param {number} id - ID of the user to be searched for
 * @returns {func} The found user
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};
