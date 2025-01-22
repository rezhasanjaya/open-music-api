const Joi = require("joi");

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  body: Joi.number().integer().required(),
});

module.exports = { AlbumPayloadSchema };
