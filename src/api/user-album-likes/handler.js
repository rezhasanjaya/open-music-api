const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postUserAlbumLikesHandler(request, h) {
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

  async deleteUserAlbumLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.unlikeAlbum(albumId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Batal menyukai Album',
    });
    response.code(201);
    return response;
  }

  async getUserAlbumLikesHandler(request) {
    const { id: albumId } = request.params;

    const likes = await this._service.getLikesCount(albumId);

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = UserAlbumLikesHandler;
