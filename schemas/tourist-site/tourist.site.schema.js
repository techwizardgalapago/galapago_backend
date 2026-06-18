const Joi = require("joi");

const siteID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const filterField = Joi.string().min(3).max(30);
const filterValue = Joi.string().min(3).max(30);

const getSiteSchema = Joi.object({
  id: siteID.required(),
});

const querySiteSchema = Joi.object({
  limit,
  offset,
  filterField,
  filterValue,
});

module.exports = {
  getSiteSchema,
  querySiteSchema,
};
