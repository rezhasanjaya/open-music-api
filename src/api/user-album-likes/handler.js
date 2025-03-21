const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.likeAlbum(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Menyukai Album',
    });
    response.code(201);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;

