const PlaylistSongActivitiesHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "playlistSongActivities",
  version: "1.0.0",
  register: async (server, { service }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(
      service
      //   validator
    );
    server.route(routes(playlistSongActivitiesHandler));
  },
};
