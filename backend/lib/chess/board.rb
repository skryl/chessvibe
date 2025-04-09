require_relative 'pieces/piece'
require_relative 'pieces/pawn'
require_relative 'pieces/knight'
require_relative 'pieces/bishop'
require_relative 'pieces/rook'
require_relative 'pieces/queen'
require_relative 'pieces/king'

module Chess
  class Board
    RANKS = 8
    FILES = 8

    attr_reader :squares, :captured_pieces

    def initialize(setup = true)
      @squares = Array.new(RANKS) { Array.new(FILES) }
      @captured_pieces = []
      setup_board unless setup == false
    end

    def self.from_fen(fen)
      board = new(false)

      # Parse FEN
      fen_parts = fen.split(' ')
      piece_placement = fen_parts[0]

      # Set up pieces
      ranks = piece_placement.split('/')
      ranks.each_with_index do |rank, rank_idx|
        file_idx = 0

        rank.each_char do |char|
          if char.match?(/\d/)
            # Skip empty squares
            file_idx += char.to_i
          else
            # Place piece
            color = char == char.upcase ? 'white' : 'black'
            position = "#{(file_idx + 'a'.ord).chr}#{8 - rank_idx}"

            piece = case char.downcase
                    when 'p' then Pieces::Pawn.new(color, position)
                    when 'n' then Pieces::Knight.new(color, position)
                    when 'b' then Pieces::Bishop.new(color, position)
                    when 'r' then Pieces::Rook.new(color, position)
                    when 'q' then Pieces::Queen.new(color, position)
                    when 'k' then Pieces::King.new(color, position)
                    end

            board.place_piece(piece, position)
            file_idx += 1
          end
        end
      end

      board
    end

    def setup_board
      # Place pawns
      ('a'..'h').each do |file|
        place_piece(Pieces::Pawn.new('white', "#{file}2"), "#{file}2")
        place_piece(Pieces::Pawn.new('black', "#{file}7"), "#{file}7")
      end

      # Place rooks
      place_piece(Pieces::Rook.new('white', 'a1'), 'a1')
      place_piece(Pieces::Rook.new('white', 'h1'), 'h1')
      place_piece(Pieces::Rook.new('black', 'a8'), 'a8')
      place_piece(Pieces::Rook.new('black', 'h8'), 'h8')

      # Place knights
      place_piece(Pieces::Knight.new('white', 'b1'), 'b1')
      place_piece(Pieces::Knight.new('white', 'g1'), 'g1')
      place_piece(Pieces::Knight.new('black', 'b8'), 'b8')
      place_piece(Pieces::Knight.new('black', 'g8'), 'g8')

      # Place bishops
      place_piece(Pieces::Bishop.new('white', 'c1'), 'c1')
      place_piece(Pieces::Bishop.new('white', 'f1'), 'f1')
      place_piece(Pieces::Bishop.new('black', 'c8'), 'c8')
      place_piece(Pieces::Bishop.new('black', 'f8'), 'f8')

      # Place queens
      place_piece(Pieces::Queen.new('white', 'd1'), 'd1')
      place_piece(Pieces::Queen.new('black', 'd8'), 'd8')

      # Place kings
      place_piece(Pieces::King.new('white', 'e1'), 'e1')
      place_piece(Pieces::King.new('black', 'e8'), 'e8')
    end

    def place_piece(piece, position)
      rank, file = position_to_coordinates(position)
      @squares[rank][file] = piece
      piece.position = position if piece
    end

    def piece_at(position)
      return nil unless valid_position?(position)
      rank, file = position_to_coordinates(position)
      @squares[rank][file]
    end

    def move_piece(from, to, promotion_piece = nil)
      piece = piece_at(from)
      target = piece_at(to)

      return { valid: false, error: 'No piece at starting position' } unless piece

      if target && target.color == piece.color
        return { valid: false, error: 'Cannot capture your own piece' }
      end

      # Add target to captured pieces if it exists
      @captured_pieces << target if target

      # Move piece
      rank, file = position_to_coordinates(from)
      @squares[rank][file] = nil
      place_piece(piece, to)
      piece.move_to(to)

      # Handle pawn promotion
      if piece.is_a?(Pieces::Pawn) && (to[1] == '8' || to[1] == '1')
        handle_promotion(to, piece.color, promotion_piece)
      end

      # Return result
      {
        valid: true,
        capture: !!target,
        piece: piece.type,
        from: from,
        to: to,
        promotion: piece.is_a?(Pieces::Pawn) && (to[1] == '8' || to[1] == '1')
      }
    end

    def handle_promotion(position, color, promotion_piece_type)
      promotion_piece_type ||= 'queen' # Default to queen

      new_piece = case promotion_piece_type.downcase
                 when 'queen' then Pieces::Queen.new(color, position)
                 when 'rook' then Pieces::Rook.new(color, position)
                 when 'bishop' then Pieces::Bishop.new(color, position)
                 when 'knight' then Pieces::Knight.new(color, position)
                 else Pieces::Queen.new(color, position)
                 end

      place_piece(new_piece, position)
    end

    def valid_position?(position)
      return false unless position.is_a?(String) && position.length == 2

      file = position[0]
      rank = position[1]

      file.match?(/[a-h]/) && rank.match?(/[1-8]/)
    end

    def position_to_coordinates(position)
      file = position[0].ord - 'a'.ord
      rank = position[1].to_i - 1
      [rank, file]
    end

    def find_king(color)
      @squares.each_with_index do |rank, rank_idx|
        rank.each_with_index do |piece, file_idx|
          if piece && piece.is_a?(Pieces::King) && piece.color == color
            return "#{(file_idx + 'a'.ord).chr}#{rank_idx + 1}"
          end
        end
      end
      nil
    end

    def pieces_for(color)
      pieces = []
      @squares.each_with_index do |rank, rank_idx|
        rank.each_with_index do |piece, file_idx|
          if piece && piece.color == color
            pieces << piece
          end
        end
      end
      pieces
    end

    def to_fen
      fen = ""

      (RANKS - 1).downto(0) do |rank|
        empty_count = 0

        (0...FILES).each do |file|
          piece = @squares[rank][file]

          if piece.nil?
            empty_count += 1
          else
            if empty_count > 0
              fen += empty_count.to_s
              empty_count = 0
            end

            fen += piece.to_fen
          end
        end

        if empty_count > 0
          fen += empty_count.to_s
        end

        fen += "/" unless rank == 0
      end

      fen
    end
  end
end
