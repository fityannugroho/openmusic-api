/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'text',
      primaryKey: true,
    },
    title: {
      type: 'text',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    genre: {
      type: 'text',
      notNull: true,
    },
    performer: {
      type: 'text',
      notNull: true,
    },
    duration: {
      type: 'integer',
    },
    albumId: {
      type: 'text',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
