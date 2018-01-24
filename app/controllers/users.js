import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validateSignup from '../validators/validateSignup';
import validateSignin from '../validators/validateSignin';
import User from '../models/user';
/* eslint-disable no-underscore-dangle, no-shadow */

/**
 * Module dependencies.
 */
const avatars = require('./avatars').all();


const authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * Show login form
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Shows login form
 */
const signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Show sign up form
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Show signup form
 */
const signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * Logout
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Logs out the user
 */
const signout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Activate the session
 */
const session = (req, res) => {
  res.redirect('/');
};

/**
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} assign an avatar to a registered user
 */
const checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
      .exec((err, user) => {
        if (user.avatar !== undefined) {
          res.redirect('/#!/');
        } else {
          res.redirect('/#!/');
        }
      });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * Create user
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {object} Creates a new user
 */
const create = (req, res) => {
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
          process.env.SECRET, { expiresIn: '30 days' }
        );
        return res.status(201).json({
          status: 'Success',
          message: 'Registration Successful',
          userDetails: {
            name: user.name,
            email: user.email,
            token
          }
        });
      });
    });
  })
    .catch(() => res.status(500).json({
      message: 'Opps.. An error occured. Try again soon.'
    }));
};

/**
 * Login user
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {object} Login an existing user
 */

const login = (req, res) => {
  const { errors, valid } = validateSignin(req.body);
  if (!valid) {
    return res.status(400).send(errors);
  }
  User.findOne({
    email: req.body.email
  }).then((foundUser) => {
    if (!foundUser) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid email or password'
      });
    }
    if (!foundUser.authenticate(req.body.password)) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid email or password'
      });
    }
    const token = jwt.sign(
      { id: foundUser._id },
      process.env.SECRET, { expiresIn: '30 days' }
    );
    return res.status(200).json({
      status: 'OK',
      message: 'Sign in successful.',
      userDetails: {
        name: foundUser.name,
        email: foundUser.email,
        token,
      }
    });
  }).catch(() => res.status(500).json({
    message: 'Opps.. An error occured. Try again soon.'
  }));
};

/**
 * Assign avatar to user
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} assign an avatar to a user
 */
const avatar = (req, res) => {
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

const addDonation = (req, res) => {
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
            if (user
              .donations[i].crowdrise_donation_id === req.body
                .crowdrise_donation_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
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
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Shows the user profile
 */
const show = (req, res) => {
  const user = req.profile;

  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * Send User
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {func} Returns the user details back
 */
const me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {callback} next - a callback function
 * @param {number} id - the ID of the user to be found
 * @returns {func} Returns the found user
 */
const user = (req, res, next, id) => {
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

const searchUser = (req, res) => {
  const searchQuery = req.params.username;
  if (searchQuery === '') {
    return res.status(400).json({
      message: 'Enter a value'
    });
  }
  User.find({ name: searchQuery }).exec((error, users) => {
    if (error) {
      return res.status(500).json(error);
    }
    if (users.length === 0) {
      return res.status(404).json({
        message: 'No user found'
      });
    }
    return res.status(200).json({ user: users[0].name, email: users[0].email });
  });
};
// invite user function
const inviteUser = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  const mailOptions = {
    from: 'CFH Kenya-33',
    to: req.body.recipient,
    subject: 'Invitation to join a session of cfh',
    text: `Your friend, CFH Kenya-33 has invited you to join the game, 
    Card for Humanity. Click the link to join game: ${req.body.gameLink}`,
    html: `<b>Your friend, CFH Kenya-33 has invited you to join the game, 
    Card for Humanity. Click the link to join game: ${req.body.gameLink}</b>`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      res.status(500).json({
        message: 'An error occured while trying to send your email invite'
      });
    } else {
      res.status(200).json({
        message: 'Email invite sent successfully'
      });
    }
  });
};
export {
  authCallback,
  signin,
  signup,
  signout,
  session,
  checkAvatar,
  avatar,
  create,
  login,
  addDonation,
  show,
  me,
  user,
  searchUser,
  inviteUser
};
