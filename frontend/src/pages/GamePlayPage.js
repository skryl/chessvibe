import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../components/ChessBoard';
import DebugPanel from '../components/DebugPanel';
import api, { updateApiDebugConfig } from '../services/api';
import { setDebugConfig, debugEvents } from '../components/ApiDebugger';
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
  const [debugMessages, setDebugMessages] = useState([]);
  const [clickEvents, setClickEvents] = useState([]);
  const [apiEvents, setApiEvents] = useState([]);
  const [debugOptions, setDebugOptions] = useState({
    showPollingRequests: false,
    showApiResponses: true
  });

  // Function to log click events for the debug panel
  const logClickEvent = useCallback((message) => {
    console.log("LOGGING CLICK EVENT:", message);
    const timestamp = new Date().toLocaleTimeString();
    const newEvent = `${timestamp}: ${message}`;

    // Use a callback to update state to ensure proper state updates
    setClickEvents(prev => {
      console.log("Previous click events:", prev);
      const updated = [newEvent, ...prev].slice(0, 20);
      console.log("Updated click events:", updated);
      return updated;
    });
  }, []);

  // Subscribe to API events
  useEffect(() => {
    // Convert API events to formatted strings
    const formatApiEvent = (event) => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      const type = event.type.toUpperCase();

      let details = '';
      if (event.type === 'request') {
        details = `${event.data.method} ${event.data.url}`;
      } else if (event.type === 'response') {
        details = `${event.data.status} ${event.data.url} (${event.data.duration || 'unknown'})`;
      } else if (event.type === 'error') {
        details = event.data.message;
      }

      return `${time}: [${type}] ${details}`;
    };

    // Get initial events
    const initialApiEvents = debugEvents.lastEvents.map(formatApiEvent);
    setApiEvents(initialApiEvents);

    // Subscribe to new events
    const unsubscribe = debugEvents.addListener(event => {
      const formattedEvent = formatApiEvent(event);
      setApiEvents(prev => [formattedEvent, ...prev].slice(0, 20));
      console.log("API event captured:", formattedEvent);
    });

    return unsubscribe;
  }, []);

  // Sync debug options with all debuggers
  useEffect(() => {
    setDebugConfig({ showPollingRequests: debugOptions.showPollingRequests });
    updateApiDebugConfig({ showPollingRequests: debugOptions.showPollingRequests });
  }, [debugOptions.showPollingRequests]);

  // Add a debug log function
  const addDebugMessage = useCallback((message, options = {}) => {
    console.log("ADDING DEBUG MESSAGE:", message);
    // Skip polling requests if the option is disabled
    if (options.isPollingRequest && !debugOptions.showPollingRequests) {
      return;
    }

    const formattedMessage = `${new Date().toLocaleTimeString()}: ${message}`;

    // Use a callback to update state to ensure proper state updates
    setDebugMessages(prev => {
      console.log("Previous debug messages:", prev);
      const updated = [formattedMessage, ...prev].slice(0, 20);
      console.log("Updated debug messages:", updated);
      return updated;
    });

    console.log(`DEBUG: ${message}`);
  }, [debugOptions.showPollingRequests]);

  // Add initial debug messages when component mounts
  useEffect(() => {
    // Add a forced debug message directly
    const initialMessage = `${new Date().toLocaleTimeString()}: Debug panel initialized`;
    const initialEvent = `${new Date().toLocaleTimeString()}: Debug system ready - waiting for game interaction`;
    const initialApiEvent = `${new Date().toLocaleTimeString()}: [INIT] API Debugger ready`;

    // Force-set initial messages
    setDebugMessages([initialMessage]);
    setClickEvents([initialEvent]);
    setApiEvents([initialApiEvent]);

    console.log("Set initial debug message:", initialMessage);
    console.log("Set initial click event:", initialEvent);
    console.log("Set initial API event:", initialApiEvent);

    // Add more debug messages after a small delay to ensure they appear
    setTimeout(() => {
      addDebugMessage(`Game ID: ${gameId}`);
      logClickEvent('Click on a chess piece to see events');
    }, 500);
  }, [gameId, addDebugMessage, logClickEvent]);

  // Log state changes in the debug arrays for debugging
  useEffect(() => {
    console.log("Debug messages state updated:", debugMessages);
  }, [debugMessages]);

  useEffect(() => {
    console.log("Click events state updated:", clickEvents);
  }, [clickEvents]);

  useEffect(() => {
    console.log("API events state updated:", apiEvents);
  }, [apiEvents]);

  useEffect(() => {
    fetchGameData(false); // Initial load, not from polling

    // Poll for updates every 5 seconds
    const interval = setInterval(() => fetchGameData(true), 5000);

    return () => clearInterval(interval);
  }, [gameId]);

  const fetchGameData = async (isPolling = false) => {
    try {
      setIsLoading(true);

      // Only log if it's not a polling request or if we want to show polling requests
      if (!isPolling || debugOptions.showPollingRequests) {
        addDebugMessage(`Fetching game data for game ${gameId}${isPolling ? ' (polling)' : ''}`,
                        { isPollingRequest: isPolling });
      }

      const gameData = await api.getGame(gameId, isPolling);
      console.log("Game data received:", gameData);

      const prettyData = await api.getPrettyBoard(gameId, isPolling);
      console.log("Pretty board received:", prettyData);

      setGame(gameData);
      setPrettyBoard(prettyData.pretty_board);
      setMoveHistory(prettyData.move_history);

      // Debug game state
      console.log("Game status:", gameData.status);
      console.log("Board state:", prettyData.pretty_board ? prettyData.pretty_board.length : 'None');

      // Only log successful fetches if it's not a polling request or if we want to show them
      if (!isPolling || debugOptions.showPollingRequests) {
        addDebugMessage(`Game data fetched. Current turn: ${gameData.current_turn}, Status: ${gameData.status}`,
                        { isPollingRequest: isPolling });
      }

      // If the game is over, redirect to the result page
      if (gameData.status === 'completed' || gameData.status === 'draw') {
        navigate(`/result/${gameId}`);
      }

      setError('');
    } catch (err) {
      // Always show errors, even from polling requests
      const errorMessage = `Failed to load game data: ${err.message}`;
      setError(errorMessage);
      addDebugMessage(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeMove = async (from, to) => {
    addDebugMessage(`Move attempt from ${from} to ${to}`);

    if (!selectedPlayer) {
      const errorMsg = 'Please select which player you are';
      setError(errorMsg);
      addDebugMessage(errorMsg);
      setShowPlayerSelection(true);
      return;
    }

    if (!game) {
      const errorMsg = 'Game data not loaded yet';
      setError(errorMsg);
      addDebugMessage(errorMsg);
      return;
    }

    addDebugMessage(`Selected player: ${selectedPlayer}, Current turn: ${game.current_turn}`);
    const currentPlayerId =
      game.current_turn === 'white'
        ? game.white_player.id
        : game.black_player.id;

    if (selectedPlayer !== currentPlayerId.toString()) {
      const errorMsg = `It's not your turn. Current turn: ${game.current_turn}`;
      setError(errorMsg);
      addDebugMessage(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      addDebugMessage(`Making API call to move from ${from} to ${to} for player ${selectedPlayer}`);

      const response = await api.makeMove(gameId, selectedPlayer, from, to);
      addDebugMessage(`Move API response: ${JSON.stringify(response)}`);

      await fetchGameData(false); // Not a polling request, this is after a move
      addDebugMessage('Game data refreshed after move');
    } catch (err) {
      const errorMsg = `Invalid move: ${err.message}`;
      setError(errorMsg);
      addDebugMessage(errorMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerSelect = (e) => {
    const playerId = e.target.value;
    addDebugMessage(`Player selected: ${playerId}`);
    setSelectedPlayer(playerId);
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

  // Toggle debug options
  const toggleDebugOption = (option) => {
    const newValue = !debugOptions[option];
    setDebugOptions(prev => ({
      ...prev,
      [option]: newValue
    }));

    // Sync with both debuggers
    if (option === 'showPollingRequests') {
      setDebugConfig({ showPollingRequests: newValue });
      updateApiDebugConfig({ showPollingRequests: newValue });
    }

    addDebugMessage(`Debug option '${option}' set to: ${newValue}`);
  };

  // Handle force debug click for testing
  const handleForceDebugClick = () => {
    addDebugMessage('Force debug click on a2');
    logClickEvent('Force debug click on a2');

    // Make sure we see these events in the browser console
    console.log("FORCE DEBUG CLICK - adding to logs");

    // Simulate a click on position a2
    const testPosition = 'a2';
    if (game && game.status === 'active') {
      // Find if there's a piece at a2
      const pieces = document.querySelectorAll('.board-square');
      let a2Square = null;
      pieces.forEach(p => {
        if (p.dataset.position === testPosition) {
          a2Square = p;
        }
      });

      if (a2Square) {
        a2Square.click();
        addDebugMessage(`Clicked on ${testPosition}`);
      } else {
        addDebugMessage(`Couldn't find ${testPosition} element`);
      }
    } else {
      addDebugMessage('Game not active, cannot force debug click');
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

  // Log the current debug info before rendering
  console.log("Rendering GamePlayPage with:", {
    debugMessagesCount: debugMessages.length,
    clickEventsCount: clickEvents.length,
    apiEventsCount: apiEvents.length
  });

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
            <button
              className="btn btn-info"
              onClick={() => {
                logClickEvent("Manual test click event");
                addDebugMessage("Manual test debug message");

                // Add test API event
                const timestamp = new Date().toLocaleTimeString();
                setApiEvents(prev => [`${timestamp}: [TEST] API button clicked`, ...prev]);
              }}
            >
              Test Debug
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
            logClickEvent={logClickEvent}
          />
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel
        clickEvents={clickEvents}
        gameDebugMessages={debugMessages}
        apiEvents={apiEvents}
        clearClickEvents={() => setClickEvents([])}
        clearGameDebugMessages={() => setDebugMessages([])}
        onForceDebugClick={handleForceDebugClick}
      />
    </div>
  );
};

export default GamePlayPage;