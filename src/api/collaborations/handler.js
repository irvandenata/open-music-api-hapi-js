const ClientError = require('../../exceptions/ClientError')
// const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator
    this.postCollaborationHandler = this.postCollaborationHandler.bind(this)
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this)
  }

  async postCollaborationHandler (request, h) {
    try {
      const { playlistId, userId } = request.payload
      await this._validator.validateCollaborationPayload({ playlistId, userId })

      await this._service.verifyPlaylistAccess(playlistId, request.auth.credentials.id)

      await this._service.verifyAvailablePlaylist(playlistId, request.auth.credentials.id)

      await this._service.verifyAvailableUser(userId)
      const collaborationId = await this._service.addCollaboration(playlistId, userId)
      const response = h.response({
        status: 'success',
        data: {
          collaborationId
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

  async deleteCollaborationHandler (request, h) {
    try {
      const { playlistId, userId } = request.payload
      await this._validator.validateCollaborationPayload({ playlistId, userId })
      await this._service.verifyPlaylistAccess(playlistId, request.auth.credentials.id)
      await this._service.deleteCollaboration(playlistId, userId)
      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus'
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
}

module.exports = CollaborationsHandler
