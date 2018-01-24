export default {
  app: {
    name: 'Cards for Humanity'
  },
  facebook: {
    clientID: process.env.FACEBOOK_PROD_CLIENTID,
    clientSecret: process.env.FACEBOOK_PROD_CLIENTSECRET,
    callbackURL: process.env.FACEBOOK_PROD_CALLBACKURL
  },
  twitter: {
    clientID: process.env.TWITTER_PROD_CLIENTID,
    clientSecret: process.env.TWITTER_PROD_CLIENTSECRET,
    callbackURL: process.env.TWITTER_PROD_CALLBACKURL
  },
  google: {
    clientID: process.env.GOOGLE_PROD_CLIENTID,
    clientSecret: process.env.GOOGLE_PROD_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_PROD_CALLBACKURL
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/github/callback'
  }
};
