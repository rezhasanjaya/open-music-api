/* eslint-disable camelcase */
const mapDBToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBToSingleModel = ({ id, title, year, performer, genre, duration, albumId }) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId
});


module.exports = { mapDBToModel, mapDBToSingleModel };
