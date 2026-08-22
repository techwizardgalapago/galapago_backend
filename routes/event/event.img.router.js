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

router.put(
  "/:id",
  upload.single("image"),
  validatorHandler(getEventSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const file = req.file;

      const url = await service.updateImage(id, file);
      await invalidateKeys([`events`, `events:${id}`]);
      res.send(url);
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
      const fields = await service.deleteImage(id);
      await invalidateKeys([`events`, `events:${id}`]);
      res.send(fields);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
