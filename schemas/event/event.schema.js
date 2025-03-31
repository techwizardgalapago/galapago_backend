const Joi = require("joi");

const limit = Joi.number().integer();
const offset = Joi.number().integer();
const filterField = Joi.string().min(3).max(30);
const filterValue = Joi.string().min(3).max(30);

const eventID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const eventName = Joi.string().min(3);
const eventDescription = Joi.string().min(3);
const eventTags = Joi.array().items(Joi.string().min(3).max(30));
const TelOrganizador = Joi.string().min(3);
const startTime = Joi.string().min(3).max(30);
const endTime = Joi.string().min(3).max(30);
const eventVenueID = Joi.array().items(
  Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/)
);
const organizador = Joi.string().min(3).max(30);
const eventCapacity = Joi.number();
const eventPrice = Joi.number();
const userEvents = Joi.array().items(eventID);
const imageID = Joi.string().regex(/^att[a-zA-Z0-9]{14}$/);
const url = Joi.string().uri();
const filename = Joi.string().min(3);

const eventImage = Joi.array().items(
  Joi.object({
    id: imageID,
    url: url.required(),
    filename: filename,
  })
);

const createEventSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      eventName: eventName.required(),
      eventImage: eventImage,
      eventDescription: eventDescription.required(),
      eventTags: eventTags,
      TelOrganizador: TelOrganizador,
      startTime: startTime.required(),
      endTime: endTime.required(),
      eventVenueID: eventVenueID.required(),
      organizador: organizador,
      eventCapacity: eventCapacity,
      eventPrice: eventPrice,
      userEvents: userEvents,
    }).required(),
  })
);

const updateEventSchema = Joi.object({
  eventName: eventName,
  eventImage: eventImage,
  eventDescription: eventDescription,
  eventTags: eventTags,
  TelOrganizador: TelOrganizador,
  startTime: startTime,
  endTime: endTime,
  eventVenueID: eventVenueID,
  organizador: organizador,
  eventCapacity: eventCapacity,
  eventPrice: eventPrice,
  userEvents: userEvents,
});

const getEventSchema = Joi.object({
  id: eventID.required(),
});

const queryEventSchema = Joi.object({
  limit,
  offset,
  filterField,
  filterValue,
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  getEventSchema,
  queryEventSchema,
};
