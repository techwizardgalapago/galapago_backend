const passport = require('passport')

const LocalStrategy = require('./strategies/local.strategy')
const JwtStrategy = require('./strategies/jwt.strategy')
const googleStrategy = require('./strategies/google.strategy')

passport.use(LocalStrategy)
passport.use(JwtStrategy)
passport.use(googleStrategy)

passport.serializeUser((user, done) => {
  done(null, user)
});
passport.deserializeUser((user, done) => {
  done(null, user)
});
