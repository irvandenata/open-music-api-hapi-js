const ClientError = require('../../exceptions/ClientError')
const NotFoundError = require('../../exceptions/NotFoundError')

class SongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator
    this.postSongHandler = this.postSongHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this)
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)
  }

  async postSongHandler (request, h) {
    try {
      const { title, year, genre, performer, duration, albumId } = request.payload
      this._validator.validateSongPayload(request.payload)

      const songId = await this._service.addSong({ title, year, genre, performer }, duration, albumId)
      const response = h.response({
        status: 'success',
        data: {
          songId
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
      console.error(error)
      return response
    }
  }

  async getSongsHandler (request, h) {
    const { title, performer } = request.query
    const data = await this._service.getSongs(title, performer)
    const songs = data.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer
    }))
    const response = h.response({
      status: 'success',
      data: {
        songs
      }
    })
    response.code(200)
    return response
  }

  async getSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      const song = await this._service.getSongById(id)
      const response = h.response({
        status: 'success',
        data: {
          song
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
      console.error(error)
      return response
    }
  }

  async putSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      const { title, year, performer, genre, duration, albumId } = request.payload
      this._validator.validateSongPayload(request.payload)
      await this._service.editSongById(id, { title, year, performer, genre }, duration, albumId)

      return {
        status: 'success',
        message: 'Song berhasil diperbarui'
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
      console.error(error)
      return response
    }
  }

  async deleteSongByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteSongById(id)
      return {
        status: 'success',
        message: 'Song berhasil dihapus'
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
      console.error(error)
      return response
    }
  }
}

module.exports = SongsHandler
