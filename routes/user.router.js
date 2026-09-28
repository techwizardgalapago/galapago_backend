const express = require("express");

const UserService = require("../services/user.service");
const validatorHandler = require("../middlewares/validator.handler");
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  queryUserSchema,
} = require("../schemas/user.schema");

const { getOrSetCache } = require("../libs/redis.client");

const router = express.Router();
const service = new UserService();

router.get(
  "/",
  validatorHandler(queryUserSchema, "query"),
  async (req, res, next) => {
    try {
      console.log("req.query:", req.query);
      const fields = await service.find(req.query);
      console.log("Fetched users:", fields);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  async (req, res, next) => {
    try {
      console.log("req.params:", req.params);
      const { id } = req.params;
      const fields = await getOrSetCache(`user:${id}`, async () => {
        console.log("Fetching user with ID:", id);
        return await service.findOne(id);
      }, 600); // 10 minutes
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createUserSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const fields = await service.create(body);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  validatorHandler(updateUserSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      console.log("Updating user with ID:", id, "with data:", body);
      // La invalidacion de cache la hace el servicio, que es por donde pasan
      // tambien las escrituras internas de auth.service.
      const fields = await service.update(id, body);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getUserSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const rta = await service.delete(id);
      res.send(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
