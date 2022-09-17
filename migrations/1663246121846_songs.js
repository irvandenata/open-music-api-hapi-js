/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: { type: 'varchar(1000)', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'varchar(1000)', notNull: true },
    genre: { type: 'varchar(1000)', notNull: true },
    duration: { type: 'integer', notNull: false },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"albums"',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    created_at: {
      type: 'TEXT',
      notNull: true
    },
    updated_at: {
      type: 'TEXT',
      notNull: true
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('songs')
}
