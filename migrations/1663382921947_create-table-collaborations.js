/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('collaborations', {
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
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('collaborations')
}
