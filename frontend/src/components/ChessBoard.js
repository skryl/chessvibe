import React, { useState, useEffect, useRef } from 'react';
import './ChessBoard.css';
import api from '../services/api';

// Add a helper function to detect pieces based on unicode ranges
const isPieceByCode = (charCode) => {
  // Unicode range for chess pieces: 0x2654-0x265F
  return (charCode >= 0x2654 && charCode <= 0x265F);
};

const isWhitePieceByCode = (charCode) => {
  // Unicode range for white chess pieces: 0x2654-0x2659
  return (charCode >= 0x2654 && charCode <= 0x2659);
};

const isBlackPieceByCode = (charCode) => {
  // Unicode range for black chess pieces: 0x265A-0x265F
  return (charCode >= 0x265A && charCode <= 0x265F);
};

const ChessBoard = ({ prettyBoard, currentTurn, onMakeMove, gameStatus, gameId, logClickEvent }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [boardArray, setBoardArray] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const boardRef = useRef(null);

  // Debug props on each render
  useEffect(() => {
    console.log("ChessBoard Props:", {
      gameId,
      gameStatus,
      currentTurn,
      prettyBoardLength: prettyBoard ? prettyBoard.length : 0,
      hasOnMakeMove: !!onMakeMove
    });
  }, [gameId, gameStatus, currentTurn, prettyBoard, onMakeMove]);

  // Parse the pretty board string into a 2D array
  useEffect(() => {
    if (!prettyBoard) {
      console.warn("No pretty board data provided");
      return;
    }

    console.log("Raw pretty board:", prettyBoard);

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

    console.log("Parsed board data:", boardData);
    setBoardArray(boardData);
  }, [prettyBoard]);

  // Fetch legal moves for a selected piece
  const fetchLegalMoves = async (position) => {
    if (!gameId) {
      console.error("Cannot fetch legal moves: No gameId provided");
      if (logClickEvent) logClickEvent(`Error: Cannot fetch legal moves - No gameId provided`);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching legal moves for position:", position, "gameId:", gameId);
      if (logClickEvent) logClickEvent(`Fetching legal moves for ${position}`);

      const moves = await api.getLegalMoves(gameId, position);
      console.log("Legal moves received:", moves);
      if (logClickEvent) logClickEvent(`Received ${moves.length} legal moves for ${position}`);

      setLegalMoves(moves);
    } catch (error) {
      console.error('Error fetching legal moves:', error);
      if (logClickEvent) logClickEvent(`Error fetching legal moves: ${error.message}`);
      setLegalMoves([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSquareClick = async (position) => {
    // Add a very visible log to confirm clicks are being registered
    console.log("%c SQUARE CLICKED: " + position, "background: yellow; color: black; font-size: 16px");
    if (logClickEvent) logClickEvent(`Square clicked: ${position}`);

    console.log("Current game status:", gameStatus);
    console.log("Current turn:", currentTurn);
    console.log("Is loading:", isLoading);
    console.log("Game ID:", gameId);

    if (gameStatus !== 'active') {
      console.warn(`Game not active. Current status: ${gameStatus}`);
      if (logClickEvent) logClickEvent(`Error: Game not active (${gameStatus})`);
      return;
    }

    if (isLoading) {
      console.warn("Game is loading, ignoring click");
      if (logClickEvent) logClickEvent(`Error: Game is loading, ignoring click`);
      return;
    }

    if (!gameId) {
      console.error("No game ID available, cannot handle click");
      if (logClickEvent) logClickEvent(`Error: No game ID available`);
      return;
    }

    // If no square is selected, select this one if it has a piece of the current turn
    if (!selectedSquare) {
      console.log("No square previously selected");
      const [row, col] = getSquareCoordinates(position);

      if (row < 0 || row >= boardArray.length || col < 0 || col >= boardArray[row].length) {
        console.error("Invalid coordinates:", row, col);
        if (logClickEvent) logClickEvent(`Error: Invalid coordinates (${row}, ${col})`);
        return;
      }

      const square = boardArray[row][col];
      console.log("Square contents:", square);

      if (square.piece) {
        console.log("Piece found:", square.piece);

        // Get character code for the first character of the piece
        const pieceCode = square.piece.trim().charCodeAt(0);
        console.log("Piece code:", pieceCode.toString(16), "Decimal:", pieceCode);

        // Determine if it's the current player's piece
        const isPieceOfCurrentTurn = (currentTurn === 'white' && isWhitePieceByCode(pieceCode)) ||
                                    (currentTurn === 'black' && isBlackPieceByCode(pieceCode));

        console.log("Current turn:", currentTurn);
        console.log("Is piece of current turn (by code):", isPieceOfCurrentTurn);

        if (isPieceOfCurrentTurn) {
          console.log("Setting selected square to:", position);
          if (logClickEvent) logClickEvent(`Selected ${currentTurn} piece at ${position}`);
          setSelectedSquare(position);
          // Fetch legal moves from the API
          await fetchLegalMoves(position);
        } else {
          console.warn("Cannot select piece - not your turn or not your piece");
          if (logClickEvent) logClickEvent(`Cannot select piece - not your turn (${currentTurn})`);
        }
      } else {
        console.log("No piece on selected square");
        if (logClickEvent) logClickEvent(`No piece on square ${position}`);
      }
    } else {
      console.log("Square already selected:", selectedSquare);
      // If a square is already selected and the target is a legal move, make the move
      if (position !== selectedSquare) {
        console.log("Legal moves:", legalMoves);
        console.log("Is target a legal move:", legalMoves.includes(position));

        if (legalMoves.includes(position)) {
          console.log("Making move from", selectedSquare, "to", position);
          if (logClickEvent) logClickEvent(`Making move from ${selectedSquare} to ${position}`);
          onMakeMove(selectedSquare, position);
        } else {
          // If clicking on own piece, select that piece instead
          const [row, col] = getSquareCoordinates(position);

          if (row < 0 || row >= boardArray.length || col < 0 || col >= boardArray[row].length) {
            console.error("Invalid coordinates:", row, col);
            if (logClickEvent) logClickEvent(`Error: Invalid coordinates (${row}, ${col})`);
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }

          const square = boardArray[row][col];

          if (square.piece) {
            // Get character code for the first character of the piece
            const pieceCode = square.piece.trim().charCodeAt(0);

            // Determine if it's the current player's piece
            const isPieceOfCurrentTurn = (currentTurn === 'white' && isWhitePieceByCode(pieceCode)) ||
                                       (currentTurn === 'black' && isBlackPieceByCode(pieceCode));

            if (isPieceOfCurrentTurn) {
              console.log("Re-selecting to new piece at", position);
              if (logClickEvent) logClickEvent(`Re-selecting to new piece at ${position}`);
              setSelectedSquare(position);
              await fetchLegalMoves(position);
              return;
            }
          }
        }
      }

      // Clear selection
      console.log("Clearing selection");
      if (logClickEvent) logClickEvent(`Cleared selection`);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Direct click handler for pieces with debugging
  const handlePieceClick = (e, position) => {
    console.log("%c PIECE CLICKED: " + position, "background: green; color: white; font-size: 16px");
    if (logClickEvent) logClickEvent(`Piece clicked: ${position}`);

    console.log("Event target:", e.target.tagName, e.target.className);
    console.log("Event currentTarget:", e.currentTarget.tagName, e.currentTarget.className);

    // Prevent default to ensure no browser issues
    e.preventDefault();
    e.stopPropagation(); // Prevent the event from bubbling to the square

    // Directly call handleSquareClick as if the square was clicked
    handleSquareClick(position);
  };

  const getSquareCoordinates = (position) => {
    const file = position.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    const rank = 8 - parseInt(position[1]);   // Ranks are inverted in our array
    return [rank, file];
  };

  const isWhitePiece = (piece) => {
    // Try with the character code method first
    if (piece && piece.length > 0) {
      const charCode = piece.trim().charCodeAt(0);
      if (isWhitePieceByCode(charCode)) return true;
    }

    // Fallback to the string comparison
    const whiteChessPieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const result = whiteChessPieces.includes(piece) || whiteChessPieces.includes(piece.trim());

    console.log("Is white piece?", piece, result, "Length:", piece.length);
    console.log("Character codes:", [...piece].map(c => c.charCodeAt(0)));
    return result;
  };

  const isBlackPiece = (piece) => {
    // Try with the character code method first
    if (piece && piece.length > 0) {
      const charCode = piece.trim().charCodeAt(0);
      if (isBlackPieceByCode(charCode)) return true;
    }

    // Fallback to the string comparison
    const blackChessPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
    const result = blackChessPieces.includes(piece) || blackChessPieces.includes(piece.trim());

    console.log("Is black piece?", piece, result, "Length:", piece.length);
    console.log("Character codes:", [...piece].map(c => c.charCodeAt(0)));
    return result;
  };

  const isSquareSelected = (position) => {
    return position === selectedSquare;
  };

  const isLegalMove = (position) => {
    return legalMoves.includes(position);
  };

  console.log("Rendering chess board with state:", {
    selectedSquare,
    legalMoves,
    currentTurn,
    gameStatus,
    boardArraySize: boardArray.length,
    pieceCount: boardArray.flat().filter(square => square.piece).length
  });

  // Force a click on selected position to debug why clicks aren't working
  useEffect(() => {
    // Add a debug click handler on the document
    const debugHandler = (e) => {
      if (e.key === 'd') {
        console.log("Debug key pressed - forcing click on a2");
        if (logClickEvent) logClickEvent(`Debug key pressed - forcing click on a2`);
        handleSquareClick('a2');
      } else if (e.key === 'e') {
        // Log the current board state
        console.log("Current board state:", {
          boardArray,
          selectedSquare,
          legalMoves,
          gameStatus,
          currentTurn,
          gameId
        });
        if (logClickEvent) logClickEvent(`Logged current board state to console`);
      }
    };

    document.addEventListener('keydown', debugHandler);
    return () => document.removeEventListener('keydown', debugHandler);
  }, [gameStatus, isLoading, boardArray, currentTurn, gameId, selectedSquare, legalMoves, logClickEvent]);

  // Alternative manual click handler for the entire board
  const handleBoardClick = (e) => {
    console.log("Board container clicked", e.target.tagName, e.target.className);
    if (logClickEvent) logClickEvent(`Board container clicked: ${e.target.tagName}`);

    // Find the closest square or piece element
    const squareElement = e.target.closest('.board-square');
    if (squareElement) {
      const position = squareElement.dataset.position;
      console.log("Found square element with position:", position);
      if (position) {
        console.log("Handling click for position:", position);
        handleSquareClick(position);
        return;
      }
    }

    console.log("No valid square found in click path");
    if (logClickEvent) logClickEvent("No valid square found in click path");
  };

  const renderPiece = (piece, position) => {
    if (!piece) return null;

    // Get the piece's character code
    const pieceCode = piece.trim().charCodeAt(0);
    const pieceClass = isWhitePieceByCode(pieceCode) ? 'white-piece' :
                      (isBlackPieceByCode(pieceCode) ? 'black-piece' : '');

    return (
      <div
        className={`piece ${pieceClass}`}
        onClick={(e) => {
          console.log("Piece div clicked", position);
          handlePieceClick(e, position);
          e.stopPropagation();
        }}
        data-position={position}
        data-piece-code={pieceCode}
      >
        {piece}
      </div>
    );
  };

  // Function to handle debug force click
  const handleForceDebugClick = () => {
    console.log("Debug click button pressed - forcing click on a2");
    if (logClickEvent) logClickEvent("Debug click button pressed - a2");
    handleSquareClick('a2');
  };

  return (
    <div
      className="chess-board"
      ref={boardRef}
      onClick={handleBoardClick}
    >
      {boardArray.length === 0 ? (
        <div className="board-error">No board data available</div>
      ) : (
        boardArray.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((square, colIndex) => {
              const isSelected = isSquareSelected(square.position);
              const isLegal = isLegalMove(square.position);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    board-square
                    ${square.color}
                    ${isSelected ? 'selected' : ''}
                    ${isLegal ? 'legal-move' : ''}
                  `}
                  onClick={(e) => {
                    console.log("Square div clicked", square.position);
                    handleSquareClick(square.position);
                    e.stopPropagation();
                  }}
                  data-position={square.position}
                >
                  {renderPiece(square.piece, square.position)}
                  <span className="square-notation">{square.position}</span>
                </div>
              );
            })}
          </div>
        ))
      )}
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

// Export the forceDebugClick function for use in other components
ChessBoard.handleForceDebugClick = (instance) => {
  if (instance && instance.handleForceDebugClick) {
    instance.handleForceDebugClick();
  }
};

export default ChessBoard;