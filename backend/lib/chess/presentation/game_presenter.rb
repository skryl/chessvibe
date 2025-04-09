module Chess
  module Presentation
    class GamePresenter
      # Generate a pretty-printed ASCII representation of the chess board
      def self.pretty_board(board)
        result = "    a   b   c   d   e   f   g   h  \n"
        result += "  +---+---+---+---+---+---+---+---+\n"

        (7).downto(0) do |rank|
          result += "#{rank + 1} |"

          (0..7).each do |file|
            position = "#{(file + 'a'.ord).chr}#{rank + 1}"
            piece = board.piece_at(position)

            if piece
              # Unicode chess symbols
              symbol = case piece.type
                when 'pawn'   then piece.color == 'white' ? '♙' : '♟'
                when 'knight' then piece.color == 'white' ? '♘' : '♞'
                when 'bishop' then piece.color == 'white' ? '♗' : '♝'
                when 'rook'   then piece.color == 'white' ? '♖' : '♜'
                when 'queen'  then piece.color == 'white' ? '♕' : '♛'
                when 'king'   then piece.color == 'white' ? '♔' : '♚'
              end
              result += " #{symbol} |"
            else
              result += "   |"
            end
          end

          result += " #{rank + 1}\n"
          result += "  +---+---+---+---+---+---+---+---+\n"
        end

        result += "    a   b   c   d   e   f   g   h  \n"
        result
      end

      # Format move history into standard chess notation
      def self.format_move_history(moves, white_player_username, black_player_username)
        result = []
        move_pairs = {}

        moves.each do |move|
          move_number = (move[:number] + 1) / 2
          move_pairs[move_number] ||= {}

          if move[:player] == white_player_username
            move_pairs[move_number][:white] = move[:notation]
          else
            move_pairs[move_number][:black] = move[:notation]
          end
        end

        # Format the moves in standard chess notation
        move_pairs.each do |number, pair|
          if pair[:white] && pair[:black]
            result << "#{number}. #{pair[:white]} #{pair[:black]}"
          elsif pair[:white]
            result << "#{number}. #{pair[:white]}"
          elsif pair[:black]
            result << "#{number}... #{pair[:black]}"
          end
        end

        result.join("\n")
      end
    end
  end
end