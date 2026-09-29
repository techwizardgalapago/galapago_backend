const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const EventImgService = require("../../services/event/event.img.service");
const validatorHandler = require("../../middlewares/validator.handler");
const { getEventSchema } = require("../../schemas/event/event.schema");

const { invalidateKeys } = require("../../libs/redis.client");

const router = express.Router();
const service = new EventImgService();

// `any` y no `array("images")` para que siga valiendo el campo `image` en
// singular: las versiones de la app ya publicadas suben con ese nombre.
router.put(
  "/:id",
  upload.any(),
  validatorHandler(getEventSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const files = req.files?.length ? req.files : [req.file];

      const url = await service.addImages(id, files);
      await invalidateKeys([`events`, `events:${id}`]);
      res.send(url);
    } catch (error) {
      next(error);
    }
  }
);

// Reordenar es una operacion aparte de subir: no lleva archivos, solo la lista
// de nombres en el orden deseado.
router.patch(
  "/:id/orden",
  validatorHandler(getEventSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const fields = await service.reorderImages(id, req.body?.filenames);
      await invalidateKeys([`events`, `events:${id}`]);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getEventSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      // Sin `filename` borra todas las imagenes del evento, como hacia antes.
      const fields = await service.deleteImage(id, req.query.filename || null);
      await invalidateKeys([`events`, `events:${id}`]);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
