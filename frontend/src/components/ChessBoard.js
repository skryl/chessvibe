import React, { useState, useEffect } from 'react';
import './ChessBoard.css';
import api from '../services/api';

const ChessBoard = ({ prettyBoard, currentTurn, onMakeMove, gameStatus, gameId }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [boardArray, setBoardArray] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse the pretty board string into a 2D array
  useEffect(() => {
    if (!prettyBoard) return;

    const lines = prettyBoard.split('\n');
    // Remove first/last line (labels) and empty lines
    const boardLines = lines.filter(line => line.includes('|')).filter(Boolean);

    const boardData = [];

    boardLines.forEach((line, index) => {
      // Only process actual board rows (not divider lines)
      if (line.includes('|') && !line.includes('+---+')) {
        const row = [];
        const cells = line.split('|').filter(Boolean);

        cells.forEach((cell, cellIndex) => {
          // Skip first and last cell which are row numbers
          if (cellIndex > 0 && cellIndex < cells.length - 1) {
            const piece = cell.trim();
            const rowIndex = 8 - index / 2;
            const colIndex = cellIndex - 1;
            const position = `${String.fromCharCode(97 + colIndex)}${rowIndex}`;

            row.push({
              piece: piece === '' ? null : piece,
              position,
              color: (rowIndex + colIndex) % 2 === 0 ? 'black' : 'white'
            });
          }
        });

        if (row.length > 0) {
          boardData.push(row);
        }
      }
    });

    setBoardArray(boardData);
  }, [prettyBoard]);

  // Fetch legal moves for a selected piece
  const fetchLegalMoves = async (position) => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const moves = await api.getLegalMoves(gameId, position);
      setLegalMoves(moves);
    } catch (error) {
      console.error('Error fetching legal moves:', error);
      setLegalMoves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSquareClick = async (position) => {
    if (gameStatus !== 'active' || isLoading) return;

    // If no square is selected, select this one if it has a piece of the current turn
    if (!selectedSquare) {
      const [row, col] = getSquareCoordinates(position);
      const square = boardArray[row][col];

      if (square.piece) {
        const isPieceOfCurrentTurn =
          (currentTurn === 'white' && isWhitePiece(square.piece)) ||
          (currentTurn === 'black' && isBlackPiece(square.piece));

        if (isPieceOfCurrentTurn) {
          setSelectedSquare(position);
          // Fetch legal moves from the API
          await fetchLegalMoves(position);
        }
      }
    } else {
      // If a square is already selected and the target is a legal move, make the move
      if (position !== selectedSquare) {
        if (legalMoves.includes(position)) {
          onMakeMove(selectedSquare, position);
        } else {
          // If clicking on own piece, select that piece instead
          const [row, col] = getSquareCoordinates(position);
          const square = boardArray[row][col];

          if (square.piece) {
            const isPieceOfCurrentTurn =
              (currentTurn === 'white' && isWhitePiece(square.piece)) ||
              (currentTurn === 'black' && isBlackPiece(square.piece));

            if (isPieceOfCurrentTurn) {
              setSelectedSquare(position);
              await fetchLegalMoves(position);
              return;
            }
          }
        }
      }

      // Clear selection
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const getSquareCoordinates = (position) => {
    const file = position.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    const rank = 8 - parseInt(position[1]);   // Ranks are inverted in our array
    return [rank, file];
  };

  const isWhitePiece = (piece) => {
    return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece.trim());
  };

  const isBlackPiece = (piece) => {
    return ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece.trim());
  };

  const isSquareSelected = (position) => {
    return position === selectedSquare;
  };

  const isLegalMove = (position) => {
    return legalMoves.includes(position);
  };

  return (
    <div className="chess-board">
      {boardArray.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((square, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                board-square
                ${square.color}
                ${isSquareSelected(square.position) ? 'selected' : ''}
                ${isLegalMove(square.position) ? 'legal-move' : ''}
              `}
              onClick={() => handleSquareClick(square.position)}
            >
              {square.piece && <span className="piece">{square.piece}</span>}
              <span className="square-notation">{square.position}</span>
            </div>
          ))}
        </div>
      ))}
      {gameStatus !== 'active' && (
        <div className="game-overlay">
          <div className="overlay-content">
            {gameStatus === 'checkmate' ? 'Checkmate!' : 'Game Over'}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="loading-overlay">
          <div className="overlay-content">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;