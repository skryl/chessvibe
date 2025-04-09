class Game < ActiveRecord::Base
  belongs_to :white_player, class_name: 'User'
  belongs_to :black_player, class_name: 'User'
  belongs_to :winner, class_name: 'User', optional: true
  has_many :moves, dependent: :destroy

  validates :white_player_id, presence: true
  validates :black_player_id, presence: true
  validates :status, inclusion: { in: ['active', 'completed', 'draw', 'abandoned'] }
  validates :current_turn, inclusion: { in: ['white', 'black'] }

  before_create :initialize_ratings
  after_create :initialize_board_state

  def initialize_ratings
    self.white_player_rating_before = white_player.elo_rating
    self.black_player_rating_before = black_player.elo_rating
  end

  def initialize_board_state
    if self.board_state.blank?
      # Use standard chess starting position
      self.board_state = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    end
    save
  end

  def chess_game
    Chess::Game.from_fen(board_state)
  end

  def player_for_color(color)
    color == 'white' ? white_player : black_player
  end

  def current_player
    player_for_color(current_turn)
  end

  def opponent_of(player)
    player.id == white_player_id ? black_player : white_player
  end

  def complete(result)
    case result
    when 'white_win'
      self.winner_id = white_player_id
      self.status = 'completed'
      white_player.update_stats('win')
      black_player.update_stats('loss')
    when 'black_win'
      self.winner_id = black_player_id
      self.status = 'completed'
      black_player.update_stats('win')
      white_player.update_stats('loss')
    when 'draw'
      self.status = 'draw'
      white_player.update_stats('draw')
      black_player.update_stats('draw')
    end

    # Update Elo ratings
    rating_changes = EloRating.calculate_rating_changes(self)
    self.white_player_rating_change = rating_changes[:white]
    self.black_player_rating_change = rating_changes[:black]

    white_player.update(elo_rating: white_player.elo_rating + rating_changes[:white])
    black_player.update(elo_rating: black_player.elo_rating + rating_changes[:black])

    save
  end
end
