const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.postUserAlbumLikeHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  //   {
  //     method: 'DELETE',
  //     path: '/albums/{id}/likes',
  //     handler: handler.deleteUserAlbumLikeHandler,
  //     options: {
  //       auth: 'openmusic_jwt',
  //     },
  //   },
  //   {
  //     method: 'GET',
  //     path: '/albums/{id}/likes',
  //     handler: handler.getUserAlbumLikeHandler,
  //     options: {
  //       auth: 'openmusic_jwt',
  //     },
  //   },
];

module.exports = routes;

