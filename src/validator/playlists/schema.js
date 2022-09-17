const Joi = require('joi')

const CreatePlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string().required()
})

const AddSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
  playlistId: Joi.string().required()
})

module.exports = { CreatePlaylistPayloadSchema, AddSongToPlaylistPayloadSchema }
