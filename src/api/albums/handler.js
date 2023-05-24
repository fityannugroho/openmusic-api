const InvariantError = require('../../exceptions/InvariantError');

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
    this.postLikeAlbumHandler = this.postLikeAlbumHandler.bind(this);
    this.deleteLikeAlbumHandler = this.deleteLikeAlbumHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
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

    // Delete album cover if exist
    const { coverUrl } = await this._service.getAlbumById(id);
    if (coverUrl) {
      await this._storageService.deleteFile(coverUrl);
    }

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

  async postLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    if (await this._service.isAlbumLiked(id, credentialId)) {
      throw new InvariantError('You have liked this album before');
    }

    await this._service.likeAlbum(id, credentialId);

    return h.response({
      status: 'success',
      message: 'Album successfully liked.',
    }).code(201);
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    if (!(await this._service.isAlbumLiked(id, credentialId))) {
      throw new InvariantError('You have not liked this album before');
    }

    await this._service.unlikeAlbum(id, credentialId);

    return h.response({
      status: 'success',
      message: 'Album successfully unliked.',
    });
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const [likes, cache] = await this._service.getAlbumLikes(id);

    const res = h.response({
      status: 'success',
      data: { likes },
    });

    if (cache) {
      res.header('X-Data-Source', 'cache');
    }

    return res;
  }
}

module.exports = AlbumsHandler;
