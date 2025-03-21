const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AlbumsService = require('./AlbumsService');
// const UsersService = require('./UsersService');

class UserAlbumLikesService {
  constructor() {
    this._pool = new Pool();
    this._albumsService = new AlbumsService();
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

    return result.rows[0].id;
  }
}

module.exports = UserAlbumLikesService;

