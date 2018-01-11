import { isEmpty } from 'lodash';

/**
  * @returns { Object } validatesignin
  *
  *
  */

const validatesignin = (data) => {
  const errors = {};
  if ((data.email === undefined ||
    data.email === '') || (data.password === undefined
      || data.password === '')) {
    errors.requiredFields = 'Input an email and password to sign in!';
  }
  if (data.email === undefined || data.email === '') {
    errors.email = 'Input an email address to sign-in.';
  }
  if (data.password === undefined || data.password === '') {
    errors.password = 'Input a password to sign-in.';
  }
  return {
    errors,
    valid: isEmpty(errors),
  };
};

export default validatesignin;
