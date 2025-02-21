const autoBind = require("auto-bind");

class PlaylistSongActivitiesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const activities = await this._service.getActivities(
      playlistId,
      credentialId
    );

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  }
}
module.exports = PlaylistSongActivitiesHandler;
