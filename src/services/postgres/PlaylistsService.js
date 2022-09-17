const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')
class PlaylistsService {
  constructor () {
    this._pool = new Pool()
  }

  async addPlaylist ({ name, owner }) {
    const id = nanoid(16)

    const values = []
    values.push(id, name, owner)
    const query = {
      text: 'INSERT INTO playlists VALUES($1,$2,$3) RETURNING id',
      values
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getPlaylists (name, owner) {
    let queryName = ''
    const values = []
    values.push(owner)
    if (name) {
      queryName = 'AND playlists.name LIKE $2'
      values.push(`%${name}%`)
    }
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1 ' + queryName,
      values
    }
    const result = await this._pool.query(query)

    const queryCollaboration = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE collaborations.user_id = $1 ' + queryName,
      values
    }
    const fromCollaboration = await this._pool.query(queryCollaboration)

    const data = [
      ...result.rows,
      ...fromCollaboration.rows
    ]

    return data
  }

  async getPlaylistById (id) {
    const query = {
      text: 'SELECT playlists.id,playlists.name,users.username as username FROM playlists LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    return result.rows[0]
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async deleteSongFromPlaylist (playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu di Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async addSongToPlaylist (playlistId, songId) {
    const id = nanoid(16)
    const values = []
    values.push(id, playlistId, songId)
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }
    return result.rows[0].id
  }

  async getSongsFromPlaylist (playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    const playlist = await this.getPlaylistById(playlistId)

    const resData = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: result.rows
    }

    return resData
  }

  async verifyAvailableSong ({ songId }) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
    return true
  }

  async verifyPlaylistAddSongAccess (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    const queryCollaboration = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [id, owner]
    }
    const resultCollaboration = await this._pool.query(queryCollaboration)

    const playlist = result.rows[0]
    if (playlist.owner !== owner && !resultCollaboration.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async createActivityPlaylist (playlistId, songId, userId, action) {
    const id = nanoid(16)
    const values = []
    const time = new Date().toISOString()
    values.push(id, playlistId, userId, songId, time, action)

    const query = {
      text: 'INSERT INTO playlist_songs_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      values
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getPlaylistActivities (playlistId) {
    const query = {
      text: 'SELECT users.username,songs.title,playlist_songs_activities.action,playlist_songs_activities.time  FROM playlist_songs_activities  JOIN users ON playlist_songs_activities.user_id = users.id JOIN songs ON playlist_songs_activities.song_id = songs.id WHERE playlist_songs_activities.playlist_id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist Activities tidak ditemukan')
    }
    const data = {
      playlistId,
      activities: result.rows
    }
    return data
  }

  async verifyAvailablePlaylist (id) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    return true
  }
}

module.exports = PlaylistsService
