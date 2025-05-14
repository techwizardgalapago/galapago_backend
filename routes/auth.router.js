const express = require("express");
const passport = require("passport");

const validatorHandler = require("../middlewares/validator.handler");
// const { changePassword } = require('../schemas/auth.schema')

const router = express.Router();
const AuthService = require("../services/auth.service");

const service = new AuthService();

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const rta = await service.signToken(user);
      res.json(rta);
    } catch (error) {
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

router.get(
  "/google-login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    try {
      console.log("req.user:", req.user);
      const user = req.user;
      const rta = await service.signToken(user);
      console.log("rta:", rta);
      res.json(rta);
    } catch (error) {
      next(error);
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
