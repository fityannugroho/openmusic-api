const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    /**
     * @type {Pool}
     */
    this._pool = new Pool();
    /**
     * @type {string}
     */
    this._tableName = 'collaborations';
  }

  /**
   * Add new playlist collaborator.
   * @param {string} playlistId The playlist id.
   * @param {string} userId The user id.
   * @returns {Promise<string>} The collaboration id.
   */
  async addCollaborator(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id`,
      values: [id, playlistId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to add collaborator');
    }

    return id;
  }

  /**
   * Remove a collaborator from playlist.
   * @param {string} playlistId The playlist id.
   * @param {string} userId The user id.
   */
  async removeCollaborator(playlistId, userId) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE playlist_id = $1 AND user_id = $2 RETURNING id`,
      values: [playlistId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to remove collaborator');
    }
  }

  /**
   * Verify if a user is a playlist collaborator.
   * @param {string} playlistId The playlist id.
   * @param {string} userId The user id.
   * @throws {AuthorizationError} If user is not a collaborator.
   */
  async verifyCollaborator(playlistId, userId) {
    const result = await this._pool.query({
      text: `SELECT * FROM ${this._tableName} WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    });

    if (!result.rowCount) {
      throw new AuthorizationError(
        'You are not a collaborator in this playlist',
      );
    }
  }
}

module.exports = CollaborationsService;
