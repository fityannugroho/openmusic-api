class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind handlers to this class
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    return h.response({
      status: 'success',
      data: {
        playlistId,
      },
    }).code(201);
  }
}

module.exports = PlaylistsHandler;
