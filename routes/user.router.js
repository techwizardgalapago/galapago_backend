const express = require("express");

const UserService = require("../services/user.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  queryUserSchema,
} = require("../schemas/user.schema");

const router = express.Router();
const service = new UserService();

router.get(
  "/",
  validatorHandler(queryUserSchema, "query"),
  async (req, res, next) => {
    try {
      const fields = await service.find(req.query);
      console.log("Fetched users:", fields);
      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  async (req, res) => {
    try {
      console.log("req.params:", req.params);
      const { id } = req.params;
      console.log("Fetching user with ID:", id);
      const fields = await service.findOne(id);
      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createUserSchema, "body"),
  async (req, res) => {
    try {
      const body = req.body;
      const fields = await service.create(body);
      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.put(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  validatorHandler(updateUserSchema, "body"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const fields = await service.update(id, body);
      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const rta = await service.delete(id);
      res.send(rta);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

module.exports = router;
