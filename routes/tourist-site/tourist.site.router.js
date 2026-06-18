const express = require("express");

const TouristSiteService = require("../../services/tourist-site/tourist.site.service");
const validatorHandler = require("../../middlewares/validator.handler");
const { getSiteSchema, querySiteSchema } = require("../../schemas/tourist-site/tourist.site.schema");
const getOrSetCache = require("../../libs/redis.client");

const router = express.Router();
const service = new TouristSiteService();

router.get(
  "/",
  validatorHandler(querySiteSchema, "query"),
  async (req, res, next) => {
    try {
      const sites = await getOrSetCache("tourist-sites", async () => {
        return await service.find(req.query);
      });
      res.send(sites);
    } catch (error) {
      console.log(error);
    }
  }
);

router.get(
  "/:id",
  validatorHandler(getSiteSchema, "params"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const site = await getOrSetCache(`tourist-sites:${id}`, async () => {
        return await service.findOne(id);
      });
      res.send(site);
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
