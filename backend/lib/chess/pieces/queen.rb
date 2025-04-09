module Chess
  module Pieces
    class Queen < Piece
      def valid_moves(board)
        moves = []
        rank, file = position_to_coordinates(position)

        # Queen moves both like a rook (horizontally and vertically) and like a bishop (diagonally)
        # Directions: all eight directions (horizontal, vertical, and diagonal)
        directions = [
          [-1, 0], [0, 1], [1, 0], [0, -1],  # Rook-like moves
          [-1, -1], [-1, 1], [1, -1], [1, 1]  # Bishop-like moves
        ]

        directions.each do |rank_dir, file_dir|
          # Move in this direction until hitting a piece or the edge of the board
          new_rank, new_file = rank, file

          loop do
            new_rank += rank_dir
            new_file += file_dir

            # Stop if we've moved off the board
            break unless new_rank.between?(0, 7) && new_file.between?(0, 7)

            new_position = coordinates_to_position(new_rank, new_file)
            target_piece = board.piece_at(new_position)

            if target_piece.nil?
              # Empty square, we can move here
              moves << new_position
            else
              # We hit a piece
              if target_piece.color != color
                # Enemy piece, we can capture it
                moves << new_position
              end
              break # Stop in this direction
            end
          end
        end

        moves
      end
    end
  end
end
