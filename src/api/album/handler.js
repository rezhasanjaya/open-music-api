class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = "untitled", year } = request.payload;

    const noteId = await this._service.addNote({ name, year });

    const response = h.response({
      status: "success",
      message: "Catatan berhasil ditambahkan",
      data: {
        noteId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumsHandler;
