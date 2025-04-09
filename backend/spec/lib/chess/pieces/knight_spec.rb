require 'spec_helper'

describe Chess::Pieces::Knight do
  describe '#valid_moves' do
    let(:board) { Chess::Board.new(false) }

    it 'returns all valid knight moves from a starting position' do
      knight = Chess::Pieces::Knight.new('white', 'b1')
      board.place_piece(knight, 'b1')

      moves = knight.valid_moves(board)

      # A knight at b1 can move to a3, c3, d2
      expect(moves).to include('a3')
      expect(moves).to include('c3')
      expect(moves).to include('d2')
      expect(moves.size).to eq(3)

      # Print the actual moves for debugging
      puts "Knight at b1 valid moves: #{moves.inspect}"
    end

    it 'handles moves from the center of the board' do
      knight = Chess::Pieces::Knight.new('white', 'd4')
      board.place_piece(knight, 'd4')

      moves = knight.valid_moves(board)

      # A knight at d4 should have 8 possible moves
      expected_moves = ['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']
      expected_moves.each do |move|
        expect(moves).to include(move)
      end
      expect(moves.size).to eq(8)
    end

    it 'does not include moves that would capture friendly pieces' do
      knight = Chess::Pieces::Knight.new('white', 'd4')
      board.place_piece(knight, 'd4')
      # Place friendly pieces on some of the knight's valid moves
      board.place_piece(Chess::Pieces::Pawn.new('white', 'b3'), 'b3')
      board.place_piece(Chess::Pieces::Pawn.new('white', 'f5'), 'f5')

      moves = knight.pseudo_legal_moves(board)

      # Should not include squares with friendly pieces
      expect(moves).not_to include('b3')
      expect(moves).not_to include('f5')
      # But should still include other valid moves
      expect(moves).to include('c2')
      expect(moves).to include('e6')
    end

    it 'includes moves that would capture opponent pieces' do
      knight = Chess::Pieces::Knight.new('white', 'd4')
      board.place_piece(knight, 'd4')
      # Place enemy pieces on some of the knight's valid moves
      board.place_piece(Chess::Pieces::Pawn.new('black', 'b3'), 'b3')
      board.place_piece(Chess::Pieces::Pawn.new('black', 'f5'), 'f5')

      moves = knight.pseudo_legal_moves(board)

      # Should include squares with enemy pieces
      expect(moves).to include('b3')
      expect(moves).to include('f5')
    end
  end
end