class User < ActiveRecord::Base
  has_many :white_games, class_name: 'Game', foreign_key: 'white_player_id'
  has_many :black_games, class_name: 'Game', foreign_key: 'black_player_id'
  has_many :won_games, class_name: 'Game', foreign_key: 'winner_id'
  has_many :moves, foreign_key: 'player_id'

  validates :username, presence: true, uniqueness: true
  validates :elo_rating, numericality: { greater_than_or_equal_to: 0 }

  # Default values for stats
  after_initialize :set_defaults, if: :new_record?

  def set_defaults
    self.elo_rating ||= 1200
    self.games_played ||= 0
    self.wins ||= 0
    self.losses ||= 0
    self.draws ||= 0
  end

  def games
    Game.where('white_player_id = ? OR black_player_id = ?', id, id)
  end

  def update_stats(result)
    case result
    when 'win'
      update(wins: wins + 1, games_played: games_played + 1)
    when 'loss'
      update(losses: losses + 1, games_played: games_played + 1)
    when 'draw'
      update(draws: draws + 1, games_played: games_played + 1)
    end
  end

  # For JSON serialization - include stats
  def as_json(options = {})
    super(options).merge({
      'stats' => {
        'games_played' => games_played || 0,
        'wins' => wins || 0,
        'losses' => losses || 0,
        'draws' => draws || 0
      }
    })
  end
end
