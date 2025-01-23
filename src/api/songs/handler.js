const autoBind = require("auto-bind");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongsHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      name = "untitled",
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;

    const songId = await this._service.addSong({
      name,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: "success",
      message: "Data berhasil ditambahkan",
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = SongsHandler;

