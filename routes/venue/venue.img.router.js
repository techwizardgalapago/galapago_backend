const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const VenueImgService = require("../../services/venue/venue.img.sevice");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  getVenueSchema,
} = require("../../schemas/venue/venue.shema");

const { invalidateKeys } = require("../../libs/redis.client");

const router = express.Router();
const service = new VenueImgService();

// `any` y no `array("images")` para que siga valiendo el campo `image` en
// singular: las versiones de la app ya publicadas suben con ese nombre.
router.put(
  "/:id",
  upload.any(),
  validatorHandler(getVenueSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const files = req.files?.length ? req.files : [req.file];

      const url = await service.addImages(id, files);
      await invalidateKeys([`venues`, `venues:${id}`]);
      res.send(url);
    } catch (error) {
      console.error('Error uploading venue image:', error);
      next(error);
    }
  }
);

router.delete(
  "/:id",
  validatorHandler(getVenueSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      // Sin `filename` borra todas las imagenes del local, como hacia antes.
      const fields = await service.deleteImage(id, req.query.filename || null);
      await invalidateKeys([`venues`, `venues:${id}`]);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
