module Chess
  module Pieces
    class Knight < Piece
      def valid_moves(board)
        moves = []
        rank, file = position_to_coordinates(position)

        # Knight moves in L-shape pattern: 2 squares in one direction and 1 square perpendicular
        offsets = [
          [-2, -1], [-2, 1], # Up 2, left 1 or right 1
          [-1, -2], [-1, 2], # Up 1, left 2 or right 2
          [1, -2], [1, 2],   # Down 1, left 2 or right 2
          [2, -1], [2, 1]    # Down 2, left 1 or right 1
        ]

        offsets.each do |rank_offset, file_offset|
          new_rank = rank + rank_offset
          new_file = file + file_offset

          # Check if the new position is on the board
          if new_rank.between?(0, 7) && new_file.between?(0, 7)
            new_position = coordinates_to_position(new_rank, new_file)
            moves << new_position
          end
        end

        moves
      end
    end
  end
end
