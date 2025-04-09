require 'active_record'
require 'sqlite3'

# Create database tables
ActiveRecord::Schema.define do
  create_table :users do |t|
    t.string :username, null: false
    t.integer :elo_rating, default: 1200
    t.integer :games_played, default: 0
    t.integer :wins, default: 0
    t.integer :losses, default: 0
    t.integer :draws, default: 0
    t.timestamps
  end

  add_index :users, :username, unique: true

  create_table :games do |t|
    t.references :white_player, foreign_key: { to_table: :users }
    t.references :black_player, foreign_key: { to_table: :users }
    t.string :status, default: 'active'
    t.references :winner, foreign_key: { to_table: :users }, null: true
    t.integer :white_player_rating_before
    t.integer :black_player_rating_before
    t.integer :white_player_rating_change, default: 0
    t.integer :black_player_rating_change, default: 0
    t.string :board_state
    t.string :current_turn, default: 'white'
    t.timestamps
  end

  create_table :moves do |t|
    t.references :game, null: false
    t.references :player, null: false
    t.string :from_position, null: false
    t.string :to_position, null: false
    t.string :piece_type, null: false
    t.string :notation
    t.integer :move_number
    t.boolean :is_capture, default: false
    t.boolean :is_check, default: false
    t.boolean :is_checkmate, default: false
    t.boolean :is_castling, default: false
    t.boolean :is_en_passant, default: false
    t.boolean :is_promotion, default: false
    t.string :promotion_piece_type
    t.string :board_state_after
    t.timestamps
  end

  # Add foreign key constraints
  add_foreign_key :games, :users, column: :white_player_id
  add_foreign_key :games, :users, column: :black_player_id
  add_foreign_key :games, :users, column: :winner_id
  add_foreign_key :moves, :games, column: :game_id
  add_foreign_key :moves, :users, column: :player_id
end