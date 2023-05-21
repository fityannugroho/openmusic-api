const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    /**
     * @type {Pool}
     */
    this._pool = new Pool();
    /**
     * @type {string}
     */
    this._tableName = 'playlists';
  }

  /**
   * Add new playlist.
   * @param {object} playlist The playlist payload.
   * @param {string} playlist.name The name of playlist (required).
   * @param {string} playlist.owner The owner of playlist (required). Fill with the user id.
   * @returns {Promise<string>} The playlist id.
   * @throws {InvariantError} If failed when adding new playlist.
   */
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const result = await this._pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to add new playlist');
    }

    return id;
  }

  /**
   * Get all user playlists.
   * @param {string} userId The user id.
   * @returns {Promise<object[]>} The songs.
   */
  async getPlaylists(userId) {
    const result = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM ${this._tableName}
        INNER JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1`,
      values: [userId],
    });

    return result.rows;
  }

  /**
   * Check if user is owner of the playlist.
   * @param {string} id The playlist id.
   * @param {string} userId The id of user who is trying to access the playlist.
   * @throws {NotFoundError} if playlist not found.
   * @throws {AuthorizationError} if user is not the playlist's owner.
   */
  async verifyPlaylistOwner(id, userId) {
    const result = await this._pool.query({
      text: `SELECT * FROM ${this._tableName} WHERE id = $1`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('You are not eligible to access this resource');
    }
  }
}

module.exports = PlaylistsService;
