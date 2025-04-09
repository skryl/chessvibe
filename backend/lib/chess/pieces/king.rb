module Chess
  module Pieces
    class King < Piece
      def valid_moves(board)
        moves = []
        rank, file = position_to_coordinates(position)

        # King moves one square in any direction (horizontal, vertical, diagonal)
        directions = [
          [-1, 0], [0, 1], [1, 0], [0, -1],  # Horizontal and vertical
          [-1, -1], [-1, 1], [1, -1], [1, 1]  # Diagonal
        ]

        # Regular one-square moves
        directions.each do |rank_dir, file_dir|
          new_rank = rank + rank_dir
          new_file = file + file_dir

          # Check if the new position is on the board
          if new_rank.between?(0, 7) && new_file.between?(0, 7)
            new_position = coordinates_to_position(new_rank, new_file)
            target_piece = board.piece_at(new_position)

            if target_piece.nil? || target_piece.color != color
              # Empty square or enemy piece, we can move here
              moves << new_position
            end
          end
        end

        # Castling
        if !has_moved
          # Kingside castling
          if can_castle_kingside?(board)
            if white?
              moves << "g1"  # White kingside castling destination
            else
              moves << "g8"  # Black kingside castling destination
            end
          end

          # Queenside castling
          if can_castle_queenside?(board)
            if white?
              moves << "c1"  # White queenside castling destination
            else
              moves << "c8"  # Black queenside castling destination
            end
          end
        end

        moves
      end

      private

      def can_castle_kingside?(board)
        # Check if the kingside rook is in place and hasn't moved
        rook_position = white? ? "h1" : "h8"
        rook = board.piece_at(rook_position)

        return false unless rook && rook.is_a?(Rook) && !rook.has_moved

        # Check if squares between king and rook are empty
        middle_squares = white? ? ["f1", "g1"] : ["f8", "g8"]
        return false unless middle_squares.all? { |pos| board.piece_at(pos).nil? }

        # In a complete implementation, we would also check if the king is in check
        # or if the squares the king moves through are under attack
        true
      end

      def can_castle_queenside?(board)
        # Check if the queenside rook is in place and hasn't moved
        rook_position = white? ? "a1" : "a8"
        rook = board.piece_at(rook_position)

        return false unless rook && rook.is_a?(Rook) && !rook.has_moved

        # Check if squares between king and rook are empty
        middle_squares = white? ? ["b1", "c1", "d1"] : ["b8", "c8", "d8"]
        return false unless middle_squares.all? { |pos| board.piece_at(pos).nil? }

        # In a complete implementation, we would also check if the king is in check
        # or if the squares the king moves through are under attack
        true
      end
    end
  end
end
