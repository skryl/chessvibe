class CreateGames < ActiveRecord::Migration[7.0]
  def change
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
  end
end