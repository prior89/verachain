const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDB } = require('./database');

const configurePassport = () => {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const db = getDB();
          let user;
          let isPasswordMatch = false;

          if (db.isMemoryDB) {
            user = await db.memoryDB.findUserByEmail(email);
            if (user) {
              isPasswordMatch = await bcrypt.compare(password, user.password);
            }
          } else {
            user = await User.findOne({ email }).select('+password');
            if (user) {
              isPasswordMatch = await user.matchPassword(password);
            }
          }

          if (!user || !isPasswordMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'verachain-secret-key'
      },
      async (payload, done) => {
        try {
          const db = getDB();
          let user;

          if (db.isMemoryDB) {
            user = await db.memoryDB.findUserById(payload.id);
          } else {
            user = await User.findById(payload.id);
          }

          if (user) {
            return done(null, user);
          }
          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const db = getDB();
            let user;

            if (db.isMemoryDB) {
              user = await db.memoryDB.findUserByEmail(profile.emails[0].value);
              if (!user) {
                user = await db.memoryDB.createUser({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  googleId: profile.id,
                  avatar: profile.photos[0]?.value,
                  authProvider: 'google',
                  isVerified: true,
                  membershipTier: 'basic'
                });
              }
            } else {
              user = await User.findOne({ 
                $or: [
                  { googleId: profile.id },
                  { email: profile.emails[0].value }
                ]
              });

              if (!user) {
                user = await User.create({
                  name: profile.displayName,
                  email: profile.emails[0].value,
                  googleId: profile.id,
                  avatar: profile.photos[0]?.value,
                  authProvider: 'google',
                  isVerified: true
                });
              } else if (!user.googleId) {
                user.googleId = profile.id;
                user.authProvider = 'google';
                await user.save();
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: '/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'email', 'photos']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const db = getDB();
            let user;

            if (db.isMemoryDB) {
              user = await db.memoryDB.findUserByEmail(profile.emails?.[0]?.value);
              if (!user) {
                user = await db.memoryDB.createUser({
                  name: profile.displayName,
                  email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
                  facebookId: profile.id,
                  avatar: profile.photos?.[0]?.value,
                  authProvider: 'facebook',
                  isVerified: true,
                  membershipTier: 'basic'
                });
              }
            } else {
              user = await User.findOne({ 
                $or: [
                  { facebookId: profile.id },
                  { email: profile.emails?.[0]?.value }
                ]
              });

              if (!user) {
                user = await User.create({
                  name: profile.displayName,
                  email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
                  facebookId: profile.id,
                  avatar: profile.photos?.[0]?.value,
                  authProvider: 'facebook',
                  isVerified: true
                });
              } else if (!user.facebookId) {
                user.facebookId = profile.id;
                user.authProvider = 'facebook';
                await user.save();
              }
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDB();
      let user;

      if (db.isMemoryDB) {
        user = await db.memoryDB.findUserById(id);
      } else {
        user = await User.findById(id);
      }

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = { configurePassport };