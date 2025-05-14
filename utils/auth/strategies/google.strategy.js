const GoogleStrategy = require("passport-google-oauth2").Strategy;

const { config } = require("../../../config/config");

const options = {
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.redirectUri,
  passReqToCallback: true,
};

const googleStrategy = new GoogleStrategy(options, function (
  request,
  accessToken,
  refreshToken,
  profile,
  done
) {
  return done(null, profile);
});

module.exports = googleStrategy;
