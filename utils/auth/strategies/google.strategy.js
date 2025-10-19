// src/utils/auth/strategies/google.strategy.js
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { config } = require("../../../config/config");

// IMPORTANT: this must be the public URL that Google calls back to,
// and it MUST match the "Authorized redirect URIs" in Google Cloud.
const options = {
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.redirectUri, // e.g. http://localhost:8080/api/v1/auth/google/callback
  passReqToCallback: true,                // so we can read req.query.state
};

const googleStrategy = new GoogleStrategy(
  options,
  (req, accessToken, refreshToken, profile, done) => {
    // Map only what you need; don’t return the whole profile object
    const user = {
      provider: "google",
      providerId: profile.id,
      email: profile.email,
      name: profile.displayName,
      avatar: profile.picture,
      emailVerified: profile.verified,
    };
    return done(null, user);
  }
);

module.exports = googleStrategy;
