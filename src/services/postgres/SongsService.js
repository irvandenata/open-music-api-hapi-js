const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
class SongsService
{
  constructor ()
  {
    this._pool = new Pool();
  }

  async addSong({title,year,genre,performer},duration,albumId)
  {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    let values = []
    values.push(id,title,year,performer,genre,createdAt,updatedAt);
    let queryAdd = '';
    let add = 8;
    let addNumber = '';
    if(duration)
    {
      values.push(duration);
      queryAdd = ',duration';
      addNumber += ',$' + add;
      add += 1;
    }
    if(albumId)
    {
      values.push(albumId);
      queryAdd += ',album_id';
      addNumber += ',$' + add;
    }
    const query = {
      text: 'INSERT INTO songs(id,title,year,performer,genre,created_at,updated_at' + queryAdd + ') VALUES($1,$2,$3,$4,$5,$6,$7' + addNumber + ') RETURNING id',
      values: values,
    };

    const result = await this._pool.query(query);

    if(!result.rows[0].id)
    {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title,performer)
  {
    let query = '';
    if(title)
    {
      query = 'WHERE LOWER(title) LIKE ' + "'%" + title + "%'";
    }
    if(performer)
    {
      if(query)
      {
        query += ' AND LOWER(performer) LIKE ' + "'%" + performer + "%'";
      }
      else
      {
        query = 'WHERE LOWER(performer) LIKE ' + "'%" + performer + "%'";
      }
    }
    const result = await this._pool.query('SELECT * FROM songs ' + query);
    return result.rows;
  }

  async getSongById(id)
  {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if(!result.rows.length)
    {
      throw new NotFoundError('Song tidak ditemukan');
    }


    return result.rows[0];
  }

  async editSongById(id,{title,year,performer,genre},duration,albumId)
  {
    const check = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const checkResult = await this._pool.query(check);

    if(!checkResult.rows.length)
    {
      throw new NotFoundError('Song tidak ditemukan');
    }
    const updatedAt = new Date().toISOString();
    let durationQuery = '';
    let albumIdQuery = '';
    let values = [];
    values.push(title,genre,updatedAt,id,performer,year);
    if(duration)
    {
      values.push(duration);
      durationQuery = ',duration = $7';
    }
    if(albumId)
    {
      values.push(albumId);
      albumIdQuery = ',album_id = $8';
    }
    const query = {
      text: 'UPDATE songs SET title = $1, genre = $2, updated_at = $3,performer=$5,year=$6' + durationQuery + albumIdQuery + ' WHERE id = $4 RETURNING id',
      values: values,
    };

    const result = await this._pool.query(query);

    if(!result.rows.length)
    {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id)
  {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if(!result.rows.length)
    {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;