module Chess
  module Pieces
    class Piece
      attr_accessor :color, :position, :has_moved

      def initialize(color, position = nil)
        @color = color
        @position = position
        @has_moved = false
      end

      def move_to(new_position)
        @has_moved = true
        @position = new_position
      end

      def white?
        @color == 'white'
      end

      def black?
        @color == 'black'
      end

      def opposing_color
        white? ? 'black' : 'white'
      end

      def position_to_coordinates(position)
        file = position[0].ord - 'a'.ord
        rank = position[1].to_i - 1
        [rank, file]
      end

      def coordinates_to_position(rank, file)
        "#{(file + 'a'.ord).chr}#{rank + 1}"
      end

      def type
        self.class.name.split('::').last.downcase
      end

      # Should be overridden by subclasses
      def valid_moves(board)
        []
      end

      # Generate all pseudo-legal moves (not checking if they expose king to check)
      def pseudo_legal_moves(board)
        valid_moves(board).select do |target_position|
          target_piece = board.piece_at(target_position)
          target_piece.nil? || target_piece.color != self.color
        end
      end

      # FEN representation
      def to_fen
        char = type[0]
        white? ? char.upcase : char.downcase
      end
    end
  end
end
