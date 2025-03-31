const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const EventImgService = require("../../services/event/event.img.service");
const validatorHandler = require("../../middlewares/validator.handler");
const { getEventSchema } = require("../../schemas/event/event.schema");

const router = express.Router();
const service = new EventImgService();

router.put(
  "/:id",
  upload.single("image"),
  validatorHandler(getEventSchema, "params"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      const url = await service.updateImage(id, file);
      res.send(url);
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
      const fields = await service.deleteImage(id);
      res.send(fields);
    } catch (error) {
      //next(error)
      console.log(error);
    }
  }
);

module.exports = router;
