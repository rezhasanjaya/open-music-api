const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { mapDBToModel } = require("../../utils/playlists");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const InvariantError = require("../../exceptions/InvariantError");
const SongsService = require("../../services/postgres/SongsService");

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._songsService = new SongsService();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `
      SELECT DISTINCT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT owner FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("Anda tidak akses");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: `
            SELECT playlists.owner, collaborations.user_id 
            FROM playlists
            LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
            WHERE playlists.id = $1
        `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const isOwner = result.rows[0].owner === userId;
    const isCollaborator = result.rows.some((row) => row.user_id === userId);

    if (!isOwner && !isCollaborator) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }
  }
}

module.exports = PlaylistsService;
