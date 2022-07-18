/* eslint-disable camelcase */

const parseSongFromDB = ({ album_id, ...others }) => ({
  ...others,
  albumId: album_id,
});

const getSongSummary = ({ id, title, performer }) => ({
  id, title, performer,
});

module.exports = { parseSongFromDB, getSongSummary };
