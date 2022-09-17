/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('playlist_songs_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onUpdate: 'cascade'
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"songs"',
      onUpdate: 'cascade'
    },
    time: {
      type: 'TEXT',
      notNull: true
    },
    action: {
      type: 'TEXT',
      notNull: true
    }
  })
}

exports.down = pgm => {}
