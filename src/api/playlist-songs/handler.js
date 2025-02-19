const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, songsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async addSongPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;
      await this._playlistsService.verifyPlaylistOwner(
        playlistId,
        credentialId
      );

      await this._songsService.getSongById(songId);

      await this._playlistSongsService.addSongToPlaylist({
        playlistId,
        songId,
      });

      return {
        status: "success",
        message: "Berhasil menambahkan lagu ke playlist",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistSongsHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const playlist = await this._playlistSongsService.getPlaylistAndSongs(
      playlistId,
      credentialId
    );
    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deleteSongOnPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      await this._playlistSongsService.deleteSongOnPlaylistById(songId);

      return {
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistSongsHandler;
