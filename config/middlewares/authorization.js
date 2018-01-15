import jwt from 'jsonwebtoken';
import config from '../env/all';

const { secret } = config;

/**
 * Generic require login routing middleware
 * @export
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} response object
 */
export function requiresLogin(req, res, next) {
  const token = req.body.token || req.headers['x-token'] || req.headers.token;
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).send({
          message: 'Token expired'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(403).send({
      message: 'Token not provided'
    });
  }
}

/**
 * User authorizations routing middleware
 */
export const user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};
