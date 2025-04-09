class CreateMoves < ActiveRecord::Migration[7.0]
  def change
    create_table :moves do |t|
      t.references :game, foreign_key: true
      t.references :player, foreign_key: { to_table: :users }
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
  end
end