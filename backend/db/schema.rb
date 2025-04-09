# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2024_06_20_000003) do
  create_table "games", force: :cascade do |t|
    t.integer "white_player_id"
    t.integer "black_player_id"
    t.string "status", default: "active"
    t.integer "winner_id"
    t.integer "white_player_rating_before"
    t.integer "black_player_rating_before"
    t.integer "white_player_rating_change", default: 0
    t.integer "black_player_rating_change", default: 0
    t.string "board_state"
    t.string "current_turn", default: "white"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["black_player_id"], name: "index_games_on_black_player_id"
    t.index ["white_player_id"], name: "index_games_on_white_player_id"
    t.index ["winner_id"], name: "index_games_on_winner_id"
  end

  create_table "moves", force: :cascade do |t|
    t.integer "game_id"
    t.integer "player_id"
    t.string "from_position", null: false
    t.string "to_position", null: false
    t.string "piece_type", null: false
    t.string "notation"
    t.integer "move_number"
    t.boolean "is_capture", default: false
    t.boolean "is_check", default: false
    t.boolean "is_checkmate", default: false
    t.boolean "is_castling", default: false
    t.boolean "is_en_passant", default: false
    t.boolean "is_promotion", default: false
    t.string "promotion_piece_type"
    t.string "board_state_after"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_moves_on_game_id"
    t.index ["player_id"], name: "index_moves_on_player_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.integer "elo_rating", default: 1200
    t.integer "games_played", default: 0
    t.integer "wins", default: 0
    t.integer "losses", default: 0
    t.integer "draws", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "games", "users", column: "black_player_id"
  add_foreign_key "games", "users", column: "white_player_id"
  add_foreign_key "games", "users", column: "winner_id"
  add_foreign_key "moves", "games"
  add_foreign_key "moves", "users", column: "player_id"
end
