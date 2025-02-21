const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const PlaylistsService = require("./PlaylistsService");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
    this._playlistService = new PlaylistsService();
  }

  async addActivities({ playlistId, songId, credentialId, action }) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6, $6, $6) RETURNING id",
      values: [id, playlistId, songId, credentialId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Data gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getActivities(playlistId, credentialId) {
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const query = {
      text: `
        SELECT 
        psa.playlist_id,
        u.username,
        s.title,
        psa.action,
        psa.time
        FROM playlist_song_activities psa
        JOIN users u ON psa.user_id = u.id
        JOIN songs s ON psa.song_id = s.id
        WHERE psa.playlist_id = $1
        ORDER BY psa.time ASC; 
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Playlist yang anda cari tidak ditemukan");
    }

    return result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time,
    }));
  }
}

module.exports = PlaylistSongActivitiesService;
