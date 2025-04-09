import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../components/ChessBoard';
import api from '../services/api';
import './GamePlayPage.css';

const GamePlayPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [prettyBoard, setPrettyBoard] = useState(null);
  const [moveHistory, setMoveHistory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showPlayerSelection, setShowPlayerSelection] = useState(true);

  useEffect(() => {
    fetchGameData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchGameData, 5000);

    return () => clearInterval(interval);
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      setIsLoading(true);
      const gameData = await api.getGame(gameId);
      const prettyData = await api.getPrettyBoard(gameId);

      setGame(gameData);
      setPrettyBoard(prettyData.pretty_board);
      setMoveHistory(prettyData.move_history);

      // If the game is over, redirect to the result page
      if (gameData.status === 'completed' || gameData.status === 'draw') {
        navigate(`/result/${gameId}`);
      }

      setError('');
    } catch (err) {
      setError('Failed to load game data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeMove = async (from, to) => {
    if (!selectedPlayer) {
      setError('Please select which player you are');
      setShowPlayerSelection(true);
      return;
    }

    const currentPlayerId =
      game.current_turn === 'white'
        ? game.white_player.id
        : game.black_player.id;

    if (selectedPlayer !== currentPlayerId.toString()) {
      setError(`It's not your turn. Current turn: ${game.current_turn}`);
      return;
    }

    try {
      setIsLoading(true);
      await api.makeMove(gameId, selectedPlayer, from, to);
      await fetchGameData();
    } catch (err) {
      setError('Invalid move. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerSelect = (e) => {
    setSelectedPlayer(e.target.value);
    setShowPlayerSelection(false);
    setError('');
  };

  const handleResign = async () => {
    if (!selectedPlayer) {
      setError('Please select which player you are');
      setShowPlayerSelection(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = selectedPlayer === game.white_player.id.toString() ? 'black_win' : 'white_win';
      await api.completeGame(gameId, result);
      navigate(`/result/${gameId}`);
    } catch (err) {
      setError('Failed to resign. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferDraw = async () => {
    if (!selectedPlayer) {
      setError('Please select which player you are');
      setShowPlayerSelection(true);
      return;
    }

    if (!window.confirm('Are you sure you want to offer a draw? The other player will automatically accept in this demo.')) {
      return;
    }

    try {
      setIsLoading(true);
      await api.completeGame(gameId, 'draw');
      navigate(`/result/${gameId}`);
    } catch (err) {
      setError('Failed to offer draw. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !game) {
    return <div className="loading">Loading game data...</div>;
  }

  if (error && !game) {
    return <div className="error">{error}</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  const isCheckmate = game.in_checkmate;
  const isCheck = game.in_check;
  const gameStatus = isCheckmate ? 'checkmate' : (game.status === 'active' ? 'active' : game.status);

  return (
    <div className="game-play-page">
      <h1 className="game-title">Chess Game #{gameId}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {showPlayerSelection && (
        <div className="player-selection-overlay">
          <div className="player-selection-modal">
            <h2>Select Your Player</h2>
            <p>You must select which player you are to make moves</p>
            <div className="player-options">
              <button
                className="btn player-btn white-btn"
                onClick={() => handlePlayerSelect({ target: { value: game.white_player.id.toString() } })}
              >
                Play as White: {game.white_player.username}
              </button>
              <button
                className="btn player-btn black-btn"
                onClick={() => handlePlayerSelect({ target: { value: game.black_player.id.toString() } })}
              >
                Play as Black: {game.black_player.username}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="game-container">
        <div className="game-info">
          <div className="player-info">
            <div className={`player white-player ${selectedPlayer === game.white_player.id.toString() ? 'active-player' : ''}`}>
              <h3>White: {game.white_player.username}</h3>
              <p>Elo: {game.white_player.elo_rating}</p>
              {selectedPlayer === game.white_player.id.toString() && <span className="you-indicator">You</span>}
            </div>
            <div className={`player black-player ${selectedPlayer === game.black_player.id.toString() ? 'active-player' : ''}`}>
              <h3>Black: {game.black_player.username}</h3>
              <p>Elo: {game.black_player.elo_rating}</p>
              {selectedPlayer === game.black_player.id.toString() && <span className="you-indicator">You</span>}
            </div>
          </div>

          <div className="turn-indicator">
            <span className={`turn ${game.current_turn}`}>
              Current Turn: {game.current_turn.charAt(0).toUpperCase() + game.current_turn.slice(1)}
            </span>
            {isCheck && <span className="check-indicator">Check!</span>}
          </div>

          <div className="select-player-form">
            <label htmlFor="selectedPlayer">Playing as:</label>
            <select
              id="selectedPlayer"
              value={selectedPlayer}
              onChange={handlePlayerSelect}
              className="form-control"
            >
              <option value="">Select your player</option>
              <option value={game.white_player.id}>{game.white_player.username} (White)</option>
              <option value={game.black_player.id}>{game.black_player.username} (Black)</option>
            </select>
            <button className="btn btn-primary change-player-btn" onClick={() => setShowPlayerSelection(true)}>
              Change Player
            </button>
          </div>

          <div className="move-history">
            <h3>Move History</h3>
            <div className="moves-list">
              {moveHistory ? (
                <pre>{moveHistory}</pre>
              ) : (
                <p>No moves yet</p>
              )}
            </div>
          </div>

          <div className="game-actions">
            <button
              className="btn btn-warning"
              onClick={handleOfferDraw}
              disabled={isLoading || gameStatus !== 'active'}
            >
              Offer Draw
            </button>
            <button
              className="btn btn-danger"
              onClick={handleResign}
              disabled={isLoading || gameStatus !== 'active'}
            >
              Resign
            </button>
          </div>
        </div>

        <div className="board-container">
          <ChessBoard
            prettyBoard={prettyBoard}
            currentTurn={game.current_turn}
            onMakeMove={handleMakeMove}
            gameStatus={gameStatus}
            gameId={gameId}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePlayPage;