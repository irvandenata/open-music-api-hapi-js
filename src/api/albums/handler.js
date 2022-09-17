const ClientError = require('../../exceptions/ClientError')
const NotFoundError = require('../../exceptions/NotFoundError')
class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator
    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this)
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)
  }

  async postAlbumHandler (request, h) {
    try {
      const { name, year } = request.payload
      this._validator.validateAlbumPayload(request.payload)

      const albumId = await this._service.addAlbum({ name, year })

      const response = h.response({
        status: 'success',
        data: {
          albumId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)

      return response
    }
  }

  async getAlbumsHandler (request, h) {
    const albums = await this._service.geaAlbums()
    const response = h.response({
      status: 'success',
      data: {
        albums
      }
    })
    response.code(200)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      const album = await this._service.getAlbumById(id)
      const response = h.response({
        status: 'success',
        data: {
          album
        }
      })
      response.code(200)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async putAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      this._validator.validateAlbumPayload(request.payload)
      await this._service.editAlbumById(id, request.payload)

      return {
        status: 'success',
        message: 'Album berhasil diperbarui'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      } else if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteAlbumById(id)
      return {
        status: 'success',
        message: 'Album berhasil dihapus'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message
        })
        response.code(error.statusCode)
        return response
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      })
      response.code(500)
      return response
    }
  }
}

module.exports = AlbumsHandler
