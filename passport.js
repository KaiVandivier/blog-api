const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const bcrypt = require("bcrypt");

const User = require("./models/user");

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (email, password, done) {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) return done(null, false, { message: "Email not found." });
          // Compare password
          bcrypt.compare(password, user.password).then((match) => {
            if (!match)
              return done(null, false, { message: "Incorrect password." });
            return done(null, user);
          });
        })
        .catch(done);
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, done) {
      User.findOne({ _id: jwtPayload.id }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);
        return done(null, user);
      })
    }
  )
);
