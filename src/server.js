require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

// album
const albums = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

// song
const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongsService')
const SongsValidator = require('./validator/songs')

// authehntication
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// users
const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')

// playlists
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

// collaborations
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const authenticationsService = new AuthenticationsService()
  const usersService = new UsersService()
  const playlistsService = new PlaylistsService()
  const collaborationsService = new CollaborationsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })
  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt
    }
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator
    }
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator
    }
  },
  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator
    }
  },
  {
    plugin: playlists,
    options: {
      service: playlistsService,
      validator: PlaylistsValidator
    }
  },
  {
    plugin: collaborations,
    options: {
      service: collaborationsService,
      validator: CollaborationsValidator
    }
  }
  ])

  await server.start()
}

init()
