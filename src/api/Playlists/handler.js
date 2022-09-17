const ClientError = require('../../exceptions/ClientError')
// const NotFoundError = require('../../exceptions/NotFoundError')

class PlaylistsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this)
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this)
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this)
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this)
  }

  async postPlaylistHandler (request, h) {
    try {
      const { name } = request.payload
      const { id: credentialId } = request.auth.credentials
      this._validator.validatePlaylistPayload({ name, owner: credentialId })

      const playlistId = await this._service.addPlaylist({ name, owner: credentialId })
      const response = h.response({
        status: 'success',
        data: {
          playlistId
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

  async getPlaylistsHandler (request, h) {
    const { name } = request.query

    const playlists = await this._service.getPlaylists(name, request.auth.credentials.id)
    const response = h.response({
      status: 'success',
      data: {
        playlists
      }
    })
    response.code(200)
    return response
  }

  async postSongToPlaylistHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { songId } = request.payload
      this._validator.validateSongToPlaylistPayload({ songId, playlistId })
      await this._service.verifyPlaylistAddSongAccess(playlistId, request.auth.credentials.id)

      await this._service.verifyAvailableSong({ songId })
      await this._service.addSongToPlaylist(playlistId, songId)
      await this._service.createActivityPlaylist(playlistId, songId, request.auth.credentials.id, 'add')
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist'
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

  async getSongsFromPlaylistHandler (request, h) {
    try {
      const { playlistId } = request.params

      await this._service.verifyPlaylistAddSongAccess(playlistId, request.auth.credentials.id)

      const playlist = await this._service.getSongsFromPlaylist(playlistId)
      const response = h.response({
        status: 'success',
        data: {
          playlist
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
    }
  }

  async deleteSongFromPlaylistHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { songId } = request.payload

      await this._validator.validateSongToPlaylistPayload({ songId, playlistId })
      await this._service.verifyPlaylistAddSongAccess(playlistId, request.auth.credentials.id)

      await this._service.verifyAvailableSong({ songId })
      await this._service.deleteSongFromPlaylist(playlistId, songId)
      await this._service.createActivityPlaylist(playlistId, songId, request.auth.credentials.id, 'delete')
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist'
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
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      await this._service.verifyPlaylistAccess(id, credentialId)
      await this._service.deletePlaylistById(id)
      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil dihapus'
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

  async getPlaylistActivitiesHandler (request, h) {
    try {
      const { playlistId } = request.params
      const { id: credentialId } = request.auth.credentials
      await this._service.verifyPlaylistAccess(playlistId, credentialId)
      const activities = await this._service.getPlaylistActivities(playlistId)
      const response = h.response({
        status: 'success',
        data: activities
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
    }
  }
}

module.exports = PlaylistsHandler
