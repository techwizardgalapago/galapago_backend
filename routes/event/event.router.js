const express = require("express");

const EventService = require("../../services/event/event.service");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  createEventSchema,
  updateEventSchema,
  getEventSchema,
  queryEventSchema,
} = require("../../schemas/event/event.schema");

const router = express.Router();
const service = new EventService();

router.get(
  "/",
  validatorHandler(queryEventSchema, "query"),
  async (req, res, next) => {
    try {
      const fields = await service.find(req.query);

      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getEventSchema, "params"),
  async (req, res) => {
    try {
      const { id } = req.params;
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
  validatorHandler(createEventSchema, "body"),
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
  validatorHandler(getEventSchema, "params"),
  validatorHandler(updateEventSchema, "body"),
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
  validatorHandler(getEventSchema, "params"),
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
