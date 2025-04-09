module Chess
  class MoveValidator
    def legal_move?(game, from, to)
      piece = game.board.piece_at(from)

      # Basic validation
      return false if piece.nil?
      return false if piece.color != game.current_turn

      # Check if the move is in the list of legal moves
      legal_moves_for(game, from).include?(to)
    end

    def legal_moves_for(game, position)
      piece = game.board.piece_at(position)
      return [] if piece.nil?

      # Get all pseudo-legal moves for the piece
      pseudo_legal_moves = piece.pseudo_legal_moves(game.board)

      # Filter out moves that would put or leave the king in check
      pseudo_legal_moves.select do |target_position|
        !move_leaves_king_in_check?(game, position, target_position)
      end
    end

    def in_check?(game, color)
      # Find the king's position
      king_position = game.board.find_king(color)
      return false if king_position.nil?

      # Check if any opponent's piece can capture the king
      opponent_color = color == 'white' ? 'black' : 'white'

      game.board.pieces_for(opponent_color).any? do |piece|
        piece.pseudo_legal_moves(game.board).include?(king_position)
      end
    end

    def in_checkmate?(game, color)
      # First check if the king is in check
      return false unless in_check?(game, color)

      # Check if any move can get the king out of check
      game.board.pieces_for(color).none? do |piece|
        !legal_moves_for(game, piece.position).empty?
      end
    end

    def in_stalemate?(game, color)
      # Check if the king is not in check
      return false if in_check?(game, color)

      # Check if no legal moves are available
      game.board.pieces_for(color).none? do |piece|
        !legal_moves_for(game, piece.position).empty?
      end
    end

    private

    def move_leaves_king_in_check?(game, from, to)
      # Create a copy of the game to simulate the move
      board_copy = deep_copy_board(game.board)

      # Make the move on the copied board
      piece = board_copy.piece_at(from)
      target = board_copy.piece_at(to)

      # Move the piece
      board_copy.move_piece(from, to)

      # Check if the king is in check after the move
      king_position = board_copy.find_king(piece.color)
      opponent_color = piece.color == 'white' ? 'black' : 'white'

      board_copy.pieces_for(opponent_color).any? do |opponent_piece|
        opponent_piece.pseudo_legal_moves(board_copy).include?(king_position)
      end
    end

    def deep_copy_board(board)
      # This is a simplified deep copy for simulation purposes
      # In a real implementation, you would need a more robust copy mechanism
      new_board = Board.new(true)

      board.squares.each_with_index do |rank, rank_idx|
        rank.each_with_index do |piece, file_idx|
          if piece
            position = "#{(file_idx + 'a'.ord).chr}#{rank_idx + 1}"
            new_piece = case piece
                        when Pieces::Pawn then Pieces::Pawn.new(piece.color, position)
                        when Pieces::Knight then Pieces::Knight.new(piece.color, position)
                        when Pieces::Bishop then Pieces::Bishop.new(piece.color, position)
                        when Pieces::Rook then Pieces::Rook.new(piece.color, position)
                        when Pieces::Queen then Pieces::Queen.new(piece.color, position)
                        when Pieces::King then Pieces::King.new(piece.color, position)
                        end

            new_piece.has_moved = piece.has_moved if new_piece
            new_board.place_piece(new_piece, position)
          end
        end
      end

      new_board
    end
  end
end
