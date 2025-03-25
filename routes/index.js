const express = require("express");

//User
const userRouter = require("./user.router");

//Venue
const venueRouter = require("./venue/venue.router");
const venueImgRouter = require("./venue/venue.img.router");
const venueScheduleRouter = require("./venue/venue.schedule.router");

function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);

  //User
  router.use("/users", userRouter);

  //Venue
  router.use("/venues", venueRouter);
  router.use("/venues-img", venueImgRouter);
  router.use("/venues-schedule", venueScheduleRouter);
}

module.exports = routerApi;
