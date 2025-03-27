const express = require("express");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const VenueImgService = require("../../services/venue/venue.img.sevice");
const validatorHandler = require("../../middlewares/validator.handler");
const {
  getVenueSchema,
} = require("../../schemas/venue/venue.shema");

const router = express.Router();
const service = new VenueImgService();

router.put(
  "/:id",
  upload.single("image"),
  validatorHandler(getVenueSchema, "params"),
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
  validatorHandler(getVenueSchema, "params"),
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
