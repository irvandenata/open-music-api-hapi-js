const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')
class ActivitiesSongPlaylistsService {
  constructor () {
    this._pool = new Pool()
  }

  async addCollaboration (playlistId, userId) {
    const id = nanoid(16)
    const values = []
    values.push(id, playlistId, userId)
    const query = {
      text: 'INSERT INTO collaborations VALUES($1,$2,$3) RETURNING id',
      values
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Collaboration gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async deleteCollaboration (playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  async verifyAvailablePlaylist (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1 AND owner = $2',
      values: [id, owner]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    return true
  }

  async verifyAvailableUser (id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan')
    }
    return true
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
}

module.exports = ActivitiesSongPlaylistsService
