const express = require("express");

const VenueScheduleService = require("../../services/venue/venue.schedule.service");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  createVenueScheduleSchema,
  updateVenueScheduleSchema,
  getVenueScheduleSchema,
  queryVenueScheduleSchema,
} = require("../../schemas/venue/venue.schedule.schema");

const router = express.Router();
const service = new VenueScheduleService();

router.get(
  "/",
  validatorHandler(queryVenueScheduleSchema, "query"),
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
  validatorHandler(getVenueScheduleSchema, "params"),
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
  validatorHandler(createVenueScheduleSchema, "body"),
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
// Put no necesita :id porque se envía en el body porque hacemos multiples updates
router.put(
  "/",
  validatorHandler(updateVenueScheduleSchema, "body"),
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
  validatorHandler(getVenueScheduleSchema, "params"),
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
