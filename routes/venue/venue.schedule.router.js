const express = require("express");

const VenueScheduleService = require("../../services/venue/venue.schedule.service");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  createVenueScheduleSchema,
  updateVenueScheduleSchema,
  getVenueScheduleSchema,
  queryVenueScheduleSchema,
} = require("../../schemas/venue/venue.schedule.schema");
const { invalidateKeys } = require("../../libs/redis.client");

const router = express.Router();
const service = new VenueScheduleService();

// Los horarios viajan embebidos en la respuesta de /venues (VenueSchedules),
// asi que escribirlos invalida las claves de venues, no una propia.
const venueKeysFromBody = (body) => {
  const rows = Array.isArray(body) ? body : [body];
  const keys = new Set(["venues"]);
  rows.forEach((row) => {
    const linked = row?.fields?.linkedVenue;
    (Array.isArray(linked) ? linked : [linked]).forEach((id) => {
      if (id) keys.add(`venues:${id}`);
    });
  });
  return [...keys];
};

router.get(
  "/",
  validatorHandler(queryVenueScheduleSchema, "query"),
  async (req, res, next) => {
    try {
      const fields = await service.find(req.query);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getVenueScheduleSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const fields = await service.findOne(id);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validatorHandler(createVenueScheduleSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;
      const fields = await service.create(body);
      await invalidateKeys(venueKeysFromBody(body));
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);
// Put no necesita :id porque se envía en el body porque hacemos multiples updates
router.put(
  "/",
  validatorHandler(updateVenueScheduleSchema, "body"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const body = req.body;

      const fields = await service.update(id, body);
      await invalidateKeys(venueKeysFromBody(body));
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getVenueScheduleSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const rta = await service.delete(id);
      // Aqui solo tenemos el id del horario: se invalida la lista, y el
      // detalle del local caduca por TTL.
      await invalidateKeys([`venues`]);
      res.send(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
