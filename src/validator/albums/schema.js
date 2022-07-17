const Joi = require('joi');

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required().max(9999),
});

module.exports = AlbumsPayloadSchema;
