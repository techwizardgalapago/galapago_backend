const express = require("express");

//Auth
const authRouter = require("./auth.router");

//User
const userRouter = require("./user.router");

//Venue
const venueRouter = require("./venue/venue.router");
const venueImgRouter = require("./venue/venue.img.router");
const venueScheduleRouter = require("./venue/venue.schedule.router");

//Event
const eventRouter = require("./event/event.router");
const eventImgRouter = require("./event/event.img.router");

function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);

  //Auth
  router.use("/auth", authRouter);

  //User
  router.use("/users", userRouter);

  //Venue
  router.use("/venues", venueRouter);
  router.use("/venues-img", venueImgRouter);
  router.use("/venues-schedule", venueScheduleRouter);

  //Event
  router.use("/events", eventRouter);
  router.use("/events-img", eventImgRouter);
}

module.exports = routerApi;
