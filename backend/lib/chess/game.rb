require_relative 'board'
require_relative 'move_validator'

module Chess
  class Game
    attr_reader :board, :current_turn, :move_history

    def initialize
      @board = Board.new
      @current_turn = 'white'
      @move_history = []
      @validator = MoveValidator.new
    end

    def self.from_fen(fen)
      return new if fen.nil?

      game = new
      fen_parts = fen.split(' ')

      # Load board position
      game.instance_variable_set(:@board, Board.from_fen(fen))

      # Set current turn
      if fen_parts.length > 1
        game.instance_variable_set(:@current_turn, fen_parts[1] == 'w' ? 'white' : 'black')
      end

      game
    end

    def make_move(from, to, promotion_piece = nil)
      # Check if the move is legal
      unless @validator.legal_move?(self, from, to)
        return { valid: false, error: 'Illegal move' }
      end

      # Move the piece on the board
      move_result = @board.move_piece(from, to, promotion_piece)

      # Check if the move was valid
      if move_result[:valid]
        # Record the move
        @move_history << { from: from, to: to, piece: move_result[:piece] }

        # Switch player turn
        @current_turn = @current_turn == 'white' ? 'black' : 'white'

        # Check if the move puts the opponent in check or checkmate
        check = in_check?
        checkmate = in_checkmate?

        # Generate algebraic notation for the move
        notation = generate_notation(from, to, move_result[:piece], move_result[:capture], check, checkmate, promotion_piece)

        return {
          valid: true,
          fen: to_fen,
          notation: notation,
          capture: move_result[:capture],
          check: check,
          checkmate: checkmate,
          castling: is_castling_move?(from, to),
          en_passant: is_en_passant_move?(from, to),
          promotion: move_result[:promotion]
        }
      else
        return move_result
      end
    end

    def legal_moves_for(position)
      piece = @board.piece_at(position)

      # Debug output
      puts "Position: #{position}, Piece: #{piece.inspect}"
      puts "Current turn: #{@current_turn}, Piece color: #{piece.color if piece}"

      return [] if piece.nil? || piece.color != @current_turn

      @validator.legal_moves_for(self, position)
    end

    def in_check?(color = @current_turn)
      @validator.in_check?(self, color)
    end

    def in_checkmate?(color = @current_turn)
      @validator.in_checkmate?(self, color)
    end

    def in_stalemate?(color = @current_turn)
      @validator.in_stalemate?(self, color)
    end

    def is_castling_move?(from, to)
      piece = @board.piece_at(to)
      return false unless piece && piece.is_a?(Pieces::King)

      # Check if king moved two squares
      from_file = from[0].ord
      to_file = to[0].ord

      (to_file - from_file).abs == 2
    end

    def is_en_passant_move?(from, to)
      piece = @board.piece_at(to)
      return false unless piece && piece.is_a?(Pieces::Pawn)

      # Check if pawn moved diagonally to an empty square
      from_file = from[0]
      to_file = to[0]

      if from_file != to_file && @board.piece_at("#{to_file}#{from[1]}").nil?
        return true
      end

      false
    end

    def to_fen
      # Board position
      fen = @board.to_fen

      # Active color
      fen += " #{@current_turn[0]}"

      # Castling availability (simplified)
      fen += " KQkq"

      # En passant target square (simplified)
      fen += " -"

      # Halfmove clock and fullmove number (simplified)
      fen += " 0 1"

      fen
    end

    private

    def generate_notation(from, to, piece_type, capture, check, checkmate, promotion_piece = nil)
      notation = ""

      case piece_type
      when 'king'
        notation += capture ? 'Kx' : 'K'
      when 'queen'
        notation += capture ? 'Qx' : 'Q'
      when 'rook'
        notation += capture ? 'Rx' : 'R'
      when 'bishop'
        notation += capture ? 'Bx' : 'B'
      when 'knight'
        notation += capture ? 'Nx' : 'N'
      when 'pawn'
        if capture
          notation += "#{from[0]}x"
        end
      end

      notation += to

      # Add promotion piece
      if promotion_piece
        promotion_char = case promotion_piece
                         when 'queen' then 'Q'
                         when 'rook' then 'R'
                         when 'bishop' then 'B'
                         when 'knight' then 'N'
                         end
        notation += "=#{promotion_char}"
      end

      # Add check or checkmate symbol
      if checkmate
        notation += '#'
      elsif check
        notation += '+'
      end

      notation
    end
  end
end
