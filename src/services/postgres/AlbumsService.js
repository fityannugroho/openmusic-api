const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
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
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
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
   * @returns {Promise<object>} The album.
   * @throws {NotFoundError} if album not found.
   */
  async getAlbumById(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }

    return result.rows[0];
  }

  /**
   * Edit an album.
   * @param {string} id The album's id.
   * @param {object} attributes The album's attributes.
   * @throws {NotFoundError} if album not found.
   */
  async editAlbumById(id, { name, year }) {
    const result = await this._pool.query({
      text: 'UPDATE albums SET name = $2, year = $3 WHERE id = $1 RETURNING id',
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
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Album not found.');
    }
  }
}

module.exports = AlbumsService;
