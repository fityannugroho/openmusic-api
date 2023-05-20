const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().required().max(50),
  password: Joi.string().required(),
  fullname: Joi.string().required().max(255),
});

module.exports = { UserPayloadSchema };
