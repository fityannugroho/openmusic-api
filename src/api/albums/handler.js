class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    // Bind handlers to this class.
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      data: { albumId },
    }).code(201);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    return h.response({
      status: 'success',
      data: { album },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;
    await this._service.editAlbumById(id, { name, year });

    return h.response({
      status: 'success',
      message: 'Album successfully updated.',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album successfully deleted.',
    });
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateAlbumCoverHeaders(cover.hapi.headers);

    // Delete old cover if exists
    const { coverUrl } = await this._service.getAlbumById(id);
    if (coverUrl) {
      await this._storageService.deleteFile(coverUrl);
    }

    const fileUrl = await this._storageService.writeFile(cover, cover.hapi);
    await this._service.updateAlbumCover(id, fileUrl);

    return h.response({
      status: 'success',
      message: 'Album cover successfully changed.',
    }).code(201);
  }
}

module.exports = AlbumsHandler;
