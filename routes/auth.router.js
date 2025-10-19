const express = require("express");
const passport = require("passport");

const validatorHandler = require("../middlewares/validator.handler");
// const { changePassword } = require('../schemas/auth.schema')

const router = express.Router();
const AuthService = require("../services/auth.service");
const UserService = require("../services/user.service");

const service = new AuthService();
const userService = new UserService();

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      console.log("User logged in:", user);
      const rta = await service.signToken(user);
      console.log("rta:", rta);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      // `req.user` comes from jwt.strategy.js → payload = { sub, role }
      const userId = req.user.sub;
      console.log("🔍 /auth/me fetching user ID:", userId);

      // Fetch the full Airtable record
      const user = await userService.findOne(userId);

      // Return user data (and maybe their events)
      res.json({ user });
    } catch (error) {
      console.error("❌ /auth/me error:", error);
      next(error);
    }
  }
);

router.post("/sign-up", async (req, res, next) => {
  try {
    const user = req.body;
    const rta = await service.signToken(user);
    res.json(rta);
  } catch (error) {
    next(error);
  }
});



// router.get(
//   "/google-login",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// Start OAuth: /auth/google-login?redirect_uri=<your frontend/native return URL>
router.get("/google-login", (req, res, next) => {
  const redirectUri = req.query.redirect_uri;
  if (!redirectUri) return res.status(400).send("Missing redirect_uri");
  // Put redirectUri into OAuth state so we can get it back in the callback
  const state = encodeURIComponent(redirectUri);
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
    prompt: "select_account"
  })(req, res, next);
});

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   async (req, res, next) => {
//     try {
//       console.log("req.user:", req.user);
//       const user = req.user;
//       const rta = await service.signToken(user);
//       console.log("rta:", rta);
//       res.json(rta);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// 2) Google callback → issue app JWT → redirect back to app with token in hash
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/google-failed" }),
  async (req, res, next) => {
    try {
      const appReturn = decodeURIComponent(req.query.state || "");
      if (!appReturn) {
        console.log("❌ Falta state o redirect_uri");
        return res.status(400).send("Missing state/redirect_uri");
      }

      const { token } = await service.signToken(req.user); // your app JWT

      console.log("✅ Google login success, redirecting to:", appReturn);

      const url = new URL(appReturn);
      url.hash = `token=${encodeURIComponent(token)}`; // put token in fragment (not logs)
      console.log("state:", req.query.state);
      console.log("redirecting to:", url.toString());
      return res.redirect(url.toString());
    } catch (err) {
      next(err);
    }
  }
);

router.post("/recovery", async (req, res, next) => {
  try {
    const { email } = req.body;
    const rta = await service.sendRecovery(email);
    res.json(rta);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/change-password",
  // validatorHandler(changePassword, "body"),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      const rta = await service.changePassword(token, newPassword);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
