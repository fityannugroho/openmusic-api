const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind handlers to this class.
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });

      return h.response({
        status: 'success',
        data: { songId },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }
  }

  async getSongsHandler(request, h) {
    try {
      this._validator.validateSongFilterQuery(request.query);

      const { title, performer } = request.query;
      const songs = await this._service.getSongs({ title, performer });

      return h.response({
        status: 'success',
        data: { songs },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      return h.response({
        status: 'success',
        data: { song },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { id } = request.params;
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      await this._service.editSongById(id, {
        title, year, genre, performer, duration, albumId,
      });

      return h.response({
        status: 'success',
        message: 'Song updated successfully.',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return h.response({
        status: 'success',
        message: 'Song deleted successfully.',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }
  }
}

module.exports = SongsHandler;
