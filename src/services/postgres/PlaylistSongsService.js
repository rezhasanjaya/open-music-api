const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const SongsService = require('../../services/postgres/SongsService');
const PlaylistsService = require('./PlaylistsService');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
    this._songsService = new SongsService();
    this._playlistService = new PlaylistsService();
  }

  async addSongToPlaylist({ playlistId, songId }) {
    await this._songsService.verifySongNotInPlaylist(playlistId, songId);

    const id = `playlist_songs-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const insertQuery = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id, created_at, updated_at) VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, playlistId, songId, createdAt],
    };

    const insertResult = await this._pool.query(insertQuery);
    return insertResult.rows[0].id;
  }

  async getPlaylistAndSongs(playlistId, credentialId) {
    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    const playlistQuery = {
      text: `
        SELECT playlists.id, playlists.name, users.username 
        FROM playlists
        JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1
      `,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);

    const [playlist] = playlistResult.rows;

    if (!playlist) {
      throw new NotFoundError('Playlist yang anda cari tidak ditemukan');
    }

    const songs = await this._songsService.getPlaylistSongs(playlistId);

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSongOnPlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data gagal dihapus. Lagu tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;

