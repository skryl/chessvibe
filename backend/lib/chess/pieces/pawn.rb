module Chess
  module Pieces
    class Pawn < Piece
      def valid_moves(board)
        moves = []
        rank, file = position_to_coordinates(position)

        # Determine direction based on color
        direction = white? ? 1 : -1

        # Forward move
        forward_pos = coordinates_to_position(rank + direction, file)
        if board.valid_position?(forward_pos) && board.piece_at(forward_pos).nil?
          moves << forward_pos

          # Double move from starting position
          if !has_moved
            double_forward_pos = coordinates_to_position(rank + (2 * direction), file)
            if board.valid_position?(double_forward_pos) && board.piece_at(double_forward_pos).nil?
              moves << double_forward_pos
            end
          end
        end

        # Captures
        [-1, 1].each do |file_offset|
          capture_pos = coordinates_to_position(rank + direction, file + file_offset)
          if board.valid_position?(capture_pos)
            target = board.piece_at(capture_pos)
            if target && target.color != color
              moves << capture_pos
            end
          end
        end

        # En passant (simplified - would need game state for full implementation)
        # Implementation omitted for brevity

        moves
      end
    end
  end
end
