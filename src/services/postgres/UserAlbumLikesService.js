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

  async likeAlbum(albumId, userId) {
    await this._albumsService.verifyAlbumExist(albumId);

    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
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

