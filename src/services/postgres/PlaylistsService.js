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
   * Get a playlist.
   * @param {string} id The playlist id.
   * @returns {Promise<object[]>} The playlist.
   */
  async getPlaylist(id) {
    const result = await this._pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM ${this._tableName}
        INNER JOIN users ON users.id = playlists.owner WHERE playlists.id = $1`,
      values: [id],
    });

    return result.rows[0];
  }

  /**
   * Delete a playlist.
   * @param {string} playlistId The playlist id.
   * @throws {NotFoundError} If playlist not found.
   */
  async deletePlaylist(playlistId) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE id = $1 RETURNING id`,
      values: [playlistId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }
  }

  /**
   * Add a song into the playlist.
   * @param {string} songId The id of song.
   * @param {string} playlistId The id of playlist.
   * @returns {Promise<string>} The relation id.
   */
  async addSongToPlaylist(songId, playlistId) {
    const id = nanoid(16);

    const result = await this._pool.query({
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to add song to the playlist');
    }

    return id;
  }

  /**
   * Get all songs in a playlist.
   * @param {string} playlistId The id of playlist.
   * @returns {Promise<object[]>} Array of songs.
   */
  async getSongsFromPlaylist(playlistId) {
    const result = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
        INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    });

    return result.rows;
  }

  /**
   * Remove a song from playlist.
   * @param {string} songId The id of song to remove.
   * @param {string} playlistId The id of playlist.
   */
  async removeSongFromPlaylist(songId, playlistId) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to remove song from the playlist');
    }
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
