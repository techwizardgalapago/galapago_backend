const express = require("express");

//User
const userRouter = require("./user.router");

function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);
  

  //User
  router.use("/users", userRouter);
}

module.exports = routerApi;
