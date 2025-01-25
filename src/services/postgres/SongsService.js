const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel, mapDBToSingleModel } = require('../../utils/songs');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration = null, albumId = null }) {
    const id = 'song-' + nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Data gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title = '', performer = '' }) {
    let baseQuery = 'SELECT * FROM songs';
    const conditions = [];
    const values = [];

    if (title) {
      conditions.push('title ILIKE $' + (values.length + 1));
      values.push(`%${title}%`);

    }

    if (performer) {
      conditions.push('performer ILIKE $' + (values.length + 1));
      values.push(`%${performer}%`);

    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const result = await this._pool.query(baseQuery, values);

    return result.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data tidak ditemukan');
    }

    return result.rows.map(mapDBToSingleModel)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration = null, albumId = null }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui data. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsAlbum(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return [];
    }

    return result.rows.map(mapDBToModel);
  }
}

module.exports = SongsService;

