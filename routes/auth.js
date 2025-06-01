const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { Router } = require("express");
const router = Router();

const controller = require("../controller/AuthController");

module.exports = (app) => {
  passport.serializeUser((req, user, done) => {
    done(null, user);
  });

  passport.deserializeUser((req, user, done) => {
    process.nextTick(function () {
      return done(null, user);
    });
  });
  // Google OAuth2 strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SH,
        callbackURL: "http://localhost:7070/api/auth/google/callback",
        passReqToCallback: true, // <--- this enables access to `req`
        scope: ["profile"],
      },
      async (req, token, tokenSecret, params, profile, done) => {
        // Check if the user already exists in the database; if not, create a new user
        req.body = profile;
        const user = await controller.getUserOrCreate(req);
        return done(null, user?.value || user);
      }
    )
  );
  function isAuthenticated(req, res, next) {
    const { session } = req;
    if (req.isAuthenticated()) {
      if (session.views) {
        session.views++;
      } else {
        session.views = 1;
      }
      if (!!session.passport.user?.createdAt) {
        res.json(session.passport.user);
        return res.end();
      }
      return next();
    } else {
      session.destroy();
      res.redirect("/api/auth/google");
    }
  }

  app.use("/api/auth", router);

  // Routes
  router.post("/login", passport.authenticate("google"), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });

  router.get("/logout", (req, res) => {
    req.logout();
    res.json({ message: "Logout successful" });
  });

  router.get("/profile", isAuthenticated, controller.getUserOrCreate);

  // Google OAuth2 routes
  router.get("/google", function (req, res, next) {
    passport.authenticate("google", {
      scope: ["profile"],
    })(req, res, next);
  });

  router.get(
    "/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/api/auth/profile");
    }
  );

  router.patch("/user/update", isAuthenticated, controller.update);
};
