const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class UsersService {
  constructor() {
    /**
     * @type {Pool}
     */
    this._pool = new Pool();
    /**
     * @type {string}
     */
    this._tableName = 'users';
  }

  /**
   * Verify if user exists in database.
   * @param {string} username The username to verify.
   * @throws {InvariantError} If user already exists.
   */
  async verifyNewUsername(username) {
    const result = await this._pool.query({
      text: `SELECT username FROM ${this._tableName} WHERE username = $1`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new InvariantError('Failed to add new user. Username has already exists.');
    }
  }

  /**
   * Add new user.
   * @param {object} user The user object.
   * @param {string} user.username The username (required).
   * @param {string} user.password The password (required).
   * @param {string} user.fullname The password (required).
   * @returns {Promise<string>} The user id.
   * @throws {InvariantError} If user already exists or if failed when adding new user.
   */
  async addUser({
    username, password, fullname,
  }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this._pool.query({
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to add new user');
    }

    return id;
  }
}

module.exports = UsersService;
