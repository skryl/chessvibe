class Move < ActiveRecord::Base
  belongs_to :game
  belongs_to :player, class_name: 'User'

  validates :from_position, presence: true
  validates :to_position, presence: true
  validates :piece_type, presence: true

  before_save :set_move_number

  def set_move_number
    self.move_number ||= game.moves.count + 1
  end

  def self.record_move(game, player, from_pos, to_pos, options = {})
    chess_game = game.chess_game
    piece = chess_game.board.piece_at(from_pos)

    # Try to make the move in the chess engine
    result = chess_game.make_move(from_pos, to_pos, options[:promotion_piece])

    if result[:valid]
      # Update the board state in the database
      game.board_state = result[:fen]
      game.current_turn = game.current_turn == 'white' ? 'black' : 'white'
      game.save

      # Record the move
      move = game.moves.create!(
        player: player,
        from_position: from_pos,
        to_position: to_pos,
        piece_type: piece.type,
        notation: result[:notation],
        is_capture: result[:capture],
        is_check: result[:check],
        is_checkmate: result[:checkmate],
        is_castling: result[:castling],
        is_en_passant: result[:en_passant],
        is_promotion: result[:promotion],
        promotion_piece_type: options[:promotion_piece],
        board_state_after: result[:fen]
      )

      # If the move resulted in checkmate, complete the game
      if result[:checkmate]
        winner = game.current_turn == 'white' ? 'black_win' : 'white_win'
        game.complete(winner)
      end

      return { success: true, move: move }
    else
      return { success: false, error: result[:error] }
    end
  end
end
