const InvariantError = require('../../exceptions/InvariantError')
const { CreatePlaylistPayloadSchema, AddSongToPlaylistPayloadSchema } = require('./schema')

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = CreatePlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateSongToPlaylistPayload: (payload) => {
    const validationResult = AddSongToPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistValidator
