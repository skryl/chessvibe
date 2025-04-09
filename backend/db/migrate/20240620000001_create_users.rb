class CreateUsers < ActiveRecord::Migration[7.0]
  def change
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
  end
end