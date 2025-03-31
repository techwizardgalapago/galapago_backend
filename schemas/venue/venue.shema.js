const Joi = require("joi");

const limit = Joi.number().integer();
const offset = Joi.number().integer();
const filterField = Joi.string().min(3).max(30);
const filterValue = Joi.string().min(3).max(30);

const venueID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const venueCategory = Joi.string().min(3).max(30);
const venueLocation = Joi.string().min(3).max(30);
const venueAddress = Joi.string().min(3);
const latitude = Joi.number();
const longitude = Joi.number();
const venueContact = Joi.string().min(3);
const VenueEvents = Joi.array().items(venueID);
const venueName = Joi.string().min(3);
const negocio = Joi.boolean();
const imageID = Joi.string().regex(/^att[a-zA-Z0-9]{14}$/);
const url = Joi.string().uri();
const filename = Joi.string().min(3);
const venueImage = Joi.array().items(
  Joi.object({
    id: imageID,
    url: url.required(),
    filename: filename,
  })
);
const venueDescription = Joi.string().min(3);
const VenueSchedules = Joi.array().items(venueID);

const createVenueSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      venueCategory: venueCategory.required(),
      venueLocation: venueLocation.required(),
      venueAddress: venueAddress.required(),
      latitude: latitude,
      longitude: longitude,
      venueContact: venueContact,
      VenueEvents: VenueEvents,
      venueName: venueName.required(),
      venueImage: venueImage,
      negocio: negocio,
      venueDescription: venueDescription.required(),
      VenueSchedules: VenueSchedules,
    }).required(),
  })
);

const updateVenueSchema = Joi.object({
  venueCategory: venueCategory,
  venueLocation: venueLocation,
  venueAddress: venueAddress,
  latitude: latitude,
  longitude: longitude,
  venueContact: venueContact,
  VenueEvents: VenueEvents,
  venueName: venueName,
  venueImage: venueImage,
  negocio: negocio,
  venueDescription: venueDescription,
  VenueSchedules: VenueSchedules,
});

const getVenueSchema = Joi.object({
  id: venueID.required(),
});

const queryVenueSchema = Joi.object({
  limit,
  offset,
  filterField,
  filterValue,
});

module.exports = {
  createVenueSchema,
  updateVenueSchema,
  getVenueSchema,
  queryVenueSchema,
};
