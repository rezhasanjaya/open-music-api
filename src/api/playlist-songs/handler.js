const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  constructor(
    playlistSongsService,
    playlistsService,
    songsService,
    playlistSongActivitiesService,
    validator
  ) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._validator = validator;

    autoBind(this);
  }

  async addActivities(playlistId, songId, credentialId, action) {
    await this._playlistSongActivitiesService.addActivities({
      playlistId,
      songId,
      credentialId,
      action,
    });
  }

  async addSongPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);
    await this._playlistSongsService.addSongToPlaylist({ playlistId, songId });

    await this.addActivities(playlistId, songId, credentialId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu ke playlist',
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const playlist = await this._playlistSongsService.getPlaylistAndSongs(playlistId, credentialId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongOnPlaylistHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deleteSongOnPlaylistById(songId);

    await this.addActivities(id, songId, credentialId, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
