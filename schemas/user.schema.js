const Joi = require("joi");

const userID = Joi.string().regex(/^rec[a-zA-Z0-9]{14}$/);
const userEmail = Joi.string().email();
const password = Joi.string().min(8).max(30);
const firstName = Joi.string().min(3).max(30);
const lastName = Joi.string().min(3).max(30);
const countryOfOrigin = Joi.string().min(3).max(30);
const dateOfBirth = Joi.date();
const reasonForTravel = Joi.array().items(Joi.string().min(3).max(30));
const userRole = Joi.string().min(3).max(30);
const userEvents = Joi.array().items(Joi.string().min(3).max(30));
const userVenues = Joi.array().items(Joi.string().min(3).max(30));
const googleAccount = Joi.boolean();
const recoveryToken = Joi.string().min(10).max(100);
const limit = Joi.number().integer();
const offset = Joi.number().integer();
const filterField = Joi.string().min(3).max(30);
const filterValue = Joi.string().min(3).max(30);

const createUserSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      firstName: firstName,
      lastName: lastName,
      userEmail: userEmail.required(),
      password: password.required(),
      countryOfOrigin: countryOfOrigin,
      dateOfBirth: dateOfBirth,
      reasonForTravel: reasonForTravel,
      userRole: userRole,
      userEvents: userEvents,
      userVenues: userVenues,
      googleAccount: googleAccount,
      recoveryToken: recoveryToken,
    }).required(),
  })
);

const createUserGoogleSchema = Joi.array().items(
  Joi.object({
    fields: Joi.object({
      firstName: firstName,
      lastName: lastName,
      userEmail: userEmail.required(),
      password: password,
      countryOfOrigin: countryOfOrigin,
      dateOfBirth: dateOfBirth,
      reasonForTravel: reasonForTravel,
      userRole: userRole,
      userEvents: userEvents,
      userVenues: userVenues,
      googleAccount: googleAccount,
      recoveryToken: recoveryToken,
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
  userVenues: userVenues,
  googleAccount: googleAccount,
  recoveryToken: recoveryToken,
});

const getUserSchema = Joi.object({
  id: userID.required(),
});

const queryUserSchema = Joi.object({
  limit,
  offset,
  filterField,
  filterValue,
});

module.exports = {
  createUserSchema,
  createUserGoogleSchema,
  updateUserSchema,
  getUserSchema,
  queryUserSchema,
};
