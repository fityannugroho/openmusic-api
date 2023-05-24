const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { parseAlbumFromDB } = require('../../utils');

class AlbumsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;

    /**
     * The table name.
     * @type {string}
    */
    this._tableName = 'albums';
  }

  /**
   * Add new album.
   * @param {object} attributes The album's attributes.
   * @returns {Promise<string>} id of the new album.
   * @throws {InvariantError} if there are invalid album's attributes.
   */
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (id, name, year) VALUES ($1, $2, $3) RETURNING id`,
      values: [id, name, year],
    });

    if (result.rows[0].id !== id) {
      throw new InvariantError('Invalid request body');
    }

    return id;
  }

  /**
   * Get an album by id.
   * @param {string} id The album's id.
   * @returns {Promise<object>} The album with songs.
   * @throws {NotFoundError} if album not found.
   */
  async getAlbumById(id) {
    const result = await this._pool.query({
      text: `SELECT * FROM ${this._tableName} WHERE id = $1`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }

    const album = parseAlbumFromDB(result.rows[0]);
    const songs = await this._songsService.getSongsByAlbumId(id);

    return { ...album, songs };
  }

  /**
   * Edit an album.
   * @param {string} id The album's id.
   * @param {object} attributes The album's attributes.
   * @throws {NotFoundError} if album not found.
   */
  async editAlbumById(id, { name, year }) {
    const result = await this._pool.query({
      text: `UPDATE ${this._tableName} SET name = $2, year = $3 WHERE id = $1 RETURNING id`,
      values: [id, name, year],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }
  }

  /**
   * Delete an album.
   * @param {string} id The album's id.
   * @throws {NotFoundError} if album not found.
   */
  async deleteAlbumById(id) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE id = $1 RETURNING id`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }
  }

  /**
   * Update album cover.
   * @param {string} id The album's id.
   * @param {string} newCoverUrl The new cover url.
   * @throws {NotFoundError} if album not found.
   */
  async updateAlbumCover(id, newCoverUrl) {
    const result = await this._pool.query({
      text: `UPDATE ${this._tableName} SET cover_url = $1 WHERE id = $2 RETURNING id`,
      values: [newCoverUrl, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }

    return result.rows[0].id;
  }
}

module.exports = AlbumsService;
