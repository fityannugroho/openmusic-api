/* eslint-disable camelcase */

const parseSongFromDB = ({ album_id, ...others }) => ({
  ...others,
  albumId: album_id,
});

const parseAlbumFromDB = ({ cover_url, ...others }) => ({
  ...others,
  coverUrl: cover_url,
});

module.exports = { parseSongFromDB, parseAlbumFromDB };
