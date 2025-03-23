/* eslint-disable no-unused-vars */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AlbumsService = require('./AlbumsService');
// const UsersService = require('./UsersService');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._albumsService = new AlbumsService();
    this._cacheService = cacheService;
  }

  async isLiked(albumId, userId) {
    const query = {
      text: 'SELECT 1 FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async likeAlbum(albumId, userId) {
    await this._albumsService.verifyAlbumExist(albumId);

    const isAlreadyLiked = await this.isLiked(albumId, userId);
    if (isAlreadyLiked) {
      throw new InvariantError('Anda sudah like album ini');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal like album');
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async unlikeAlbum(albumId, userId) {
    await this._albumsService.verifyAlbumExist(albumId);

    try {
      await this.isLiked(albumId, userId);
    } catch (error) {
      throw new InvariantError('Anda belum like album ini');
    }

    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING album_id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal unlike');
    }

    const { album_id: albumIdDeleted } = result.rows[0];
    await this._cacheService.delete(`likes:${albumIdDeleted}`);
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`likes:${albumId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*)::INTEGER AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likesCount = result.rows.length > 0 ? result.rows[0].likes : 0;

      if (likesCount > 0) {
        await this._albumsService.verifyAlbumExist(albumId);
      }

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likesCount));

      return likesCount;
    }
  }
}

module.exports = UserAlbumLikesService;
