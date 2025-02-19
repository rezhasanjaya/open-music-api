const { nanoid } = require("nanoid");
const { mapDBToModel } = require("../../utils/playlists");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const SongsService = require("../../services/postgres/SongsService");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
    this._songsService = new SongsService();
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlist_songs-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan lagu ke dalam playlist");
    }

    return result.rows[0].id;
  }

  async getPlaylistAndSongs(playlistId, credentialId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username  
             FROM playlists 
             JOIN users ON users.id = playlists.owner  
             WHERE playlists.id = $1 AND playlists.owner = $2`,
      values: [playlistId, credentialId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Data tidak ditemukan");
    }

    const playlist = result.rows.map(mapDBToModel)[0];

    const songs = await this._songsService.getPlaylistSongs(playlistId);

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSongOnPlaylistById(id) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Data gagal dihapus. Lagu tidak ditemukan");
    }
  }
}

module.exports = PlaylistSongsService;
