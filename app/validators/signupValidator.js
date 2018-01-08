import { isEmpty, e } from 'lodash';
/**
 * @param {object} data - request object
  * @returns {func} validateSignup
  *
  *
  */

const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateSignup = (data) => {
  const errors = {};
  if ((data.password === undefined || data.password.trim() === '')
    && (data.email === undefined || data.email.trim() === ''
    || validEmail.test(data.email))
    && (data.name === undefined || data.name.trim() === '')) {
    errors.requiredFields = 'All fields are required.';
  }
  if (data.email === undefined || data.email.trim() === ''
  || !validEmail.test(data.email)) {
    errors.email = 'Please provide a valid email address.';
  } if (data.password === undefined || data.password.length <= 8
    || data.password.trim() === '') {
    errors.password = 'Please provide a password greater than 8 characters.';
  } if (data.name === undefined || data.name.trim() === '') {
    errors.name = 'Name is required.';
  }
  return {
    errors,
    valid: isEmpty(errors),
  };
};

export default validateSignup;
