const Joi = require("joi");

const limit = Joi.number().integer();
const offset = Joi.number().integer();
const filterField = Joi.string().min(3).max(30);
const filterValue = Joi.string().min(3).max(30);

const venueID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const linkedVenue = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const weekDay = Joi.string().min(3).max(30);
const openingTime = Joi.string().min(3).max(30);
const closingTime = Joi.string().min(3).max(30);
const VenueSchedules = Joi.array().items(venueID);

const createVenueScheduleSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      linkedVenue: Joi.array().items(linkedVenue.required()),
      weekDay: weekDay.required(),
      openingTime_: openingTime.required(),
      closingTime_: closingTime.required(),
    }),
  })
);

const updateVenueScheduleSchema = Joi.array().items(
  Joi.object({
    id: venueID.required(),
    fields: Joi.object({
      linkedVenue: Joi.array().items(linkedVenue.required()),
      weekDay: weekDay,
      openingTime_: openingTime,
      closingTime_: closingTime,
    }),
  })
);

const getVenueScheduleSchema = Joi.object({
  id: venueID.required(),
});

const queryVenueScheduleSchema = Joi.object({
  limit,
  offset,
  filterField,
  filterValue,
});

module.exports = {
  createVenueScheduleSchema,
  updateVenueScheduleSchema,
  getVenueScheduleSchema,
  queryVenueScheduleSchema,
};
