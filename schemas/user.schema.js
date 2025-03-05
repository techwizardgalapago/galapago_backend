const Joi = require("joi");

const userID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const userEmail = Joi.string().email();
const firstName = Joi.string().min(3).max(30);
const lastName = Joi.string().min(3).max(30);
const countryOfOrigin = Joi.string().min(3).max(30);
const dateOfBirth = Joi.date();
const reasonForTravel = Joi.array().items(Joi.string().min(3).max(30));
const userRole = Joi.string().min(3).max(30);
const userEvents = Joi.array().items(Joi.string().min(3).max(30));
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createUserSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      firstName: firstName.required(),
      lastName: lastName.required(),
      userEmail: userEmail.required(),
      countryOfOrigin: countryOfOrigin,
      dateOfBirth: dateOfBirth.required(),
      reasonForTravel: reasonForTravel,
      userRole: userRole.required(),
      userEvents: userEvents,
    }).required(),
  })
);

const updateUserSchema = Joi.object({
  firstName: firstName,
  lastName: lastName,
  userEmail: userEmail,
  countryOfOrigin: countryOfOrigin,
  dateOfBirth: dateOfBirth,
  reasonForTravel: reasonForTravel,
  userRole: userRole,
  userEvents: userEvents,
});

const getUserSchema = Joi.object({
  id: userID.required(),
});

const queryUserSchema = Joi.object({
  limit,
  offset,
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  queryUserSchema,
};
