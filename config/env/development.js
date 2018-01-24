export default {
  app: {
    name: 'Cards for Humanity - Development'
  },
  facebook: {
    clientID: process.env.FACEBOOK_DEV_CLIENTID,
    clientSecret: process.env.FACEBOOK_DEV_CLIENTSECRET,
    callbackURL: process.env.FACEBOOK_DEV_CALLBACKURL
  },
  twitter: {
    clientID: process.env.TWITTER_DEV_CLIENTID,
    clientSecret: process.env.TWITTER_DEV_CLIENTSECRET,
    callbackURL: process.env.TWITTER_DEV_CALLBACKURL
  },
  google: {
    clientID: process.env.GOOGLE_DEV_CLIENTID,
    clientSecret: process.env.GOOGLE_DEV_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_DEV_CALLBACKURL
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'http://cardsforhumanity.com:3000/auth/github/callback'
  }
};
