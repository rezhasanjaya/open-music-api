const Joi = require('joi');

const UserAlbumLikePayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { UserAlbumLikePayloadSchema };

