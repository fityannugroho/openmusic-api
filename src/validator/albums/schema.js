const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required().max(9999),
});

const AlbumCoverHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ).required(),
}).unknown();

module.exports = { AlbumPayloadSchema, AlbumCoverHeadersSchema };
