const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { parseSongFromDB } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();

    /**
     * The table name.
     * @type {string}
    */
    this._tableName = 'songs';
  }

  /**
   * Add new song.
   * @param {object} song The song's attributes.
   * @returns {Promise<string>} id of the new song.
   * @throws {InvariantError} if there are invalid song's attributes.
   */
  async addSong({
    title, year, genre, performer, duration = 0, albumId = null,
  }) {
    const id = `song-${nanoid(16)}`;
    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    });

    if (result.rows[0].id !== id) {
      throw new InvariantError('Failed to create song');
    }

    return id;
  }

  /**
   * Get songs, optionally filtered by title and performer.
   * @param {object} filter The filter parameters.
   * @returns {Promise<object[]>} The songs.
   */
  async getSongs(filter = {}) {
    const { title = '', performer = '' } = filter;
    const result = await this._pool.query({
      text: `SELECT id, title, performer FROM ${this._tableName} WHERE title ILIKE $1 AND performer ILIKE $2`,
      values: [`%${title}%`, `%${performer}%`],
    });

    return result.rows;
  }

  /**
   * Get all songs from an album.
   * @param {string} albumId The album's id.
   * @returns {Promise<object[]>} The songs.
   */
  async getSongsByAlbumId(albumId) {
    const result = await this._pool.query({
      text: `SELECT id, title, performer FROM ${this._tableName} WHERE album_id = $1`,
      values: [albumId],
    });

    return result.rows;
  }

  /**
   * Get a song by id.
   * @param {string} id The song's id.
   * @returns {Promise<object>} The song.
   * @throws {NotFoundError} if song not found.
   */
  async getSongById(id) {
    const result = await this._pool.query({
      text: `SELECT * FROM ${this._tableName} WHERE id = $1`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Song not found.');
    }

    return parseSongFromDB(result.rows[0]);
  }

  /**
   * Edit a song.
   * @param {string} id The song's id.
   * @param {object} attributes The song's attributes.
   * @throws {NotFoundError} if song not found.
   */
  async editSongById(id, {
    title, year, genre, performer, duration = 0, albumId = null,
  }) {
    const result = await this._pool.query({
      text: `UPDATE ${this._tableName} SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Song not found.');
    }
  }

  /**
   * Delete a song.
   * @param {string} id The song's id.
   * @throws {NotFoundError} if song not found.
   */
  async deleteSongById(id) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE id = $1 RETURNING id`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Song not found.');
    }
  }
}

module.exports = SongsService;
