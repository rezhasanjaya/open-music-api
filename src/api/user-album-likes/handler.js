/* eslint-disable no-unused-vars */
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
    response.code(200);
    return response;
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    let likes;
    let source;

    try {
      const result = await this._service.getCachedLikesCount(albumId);
      likes = result;
      source = 'cache';
    } catch (error) {
      likes = await this._service.calculateLikesCount(albumId);
      source = 'database';
    }

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.header('X-Data-Source', source);

    return response;
  }
}

module.exports = UserAlbumLikesHandler;
