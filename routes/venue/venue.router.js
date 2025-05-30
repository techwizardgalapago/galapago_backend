const express = require("express");

const VenueService = require("../../services/venue/venue.sevice");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  createVenueSchema,
  updateVenueSchema,
  getVenueSchema,
  queryVenueSchema,
} = require("../../schemas/venue/venue.shema");
const getOrSetCache = require("../../libs/redis.client");

const router = express.Router();
const service = new VenueService();

router.get(
  "/",
  validatorHandler(queryVenueSchema, "query"),
  async (req, res, next) => {
    try {
      const venues = await getOrSetCache(`venues`, async () => {
        const fields = await service.find(req.query);

        return fields;
      });
      res.send(venues);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getVenueSchema, "params"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const venue = await getOrSetCache(`venues:${id}`, async () => {
        const fields = await service.findOne(id);

        return fields;
      });

      res.send(venue);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createVenueSchema, "body"),
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
  validatorHandler(getVenueSchema, "params"),
  validatorHandler(updateVenueSchema, "body"),
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
  validatorHandler(getVenueSchema, "params"),
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
