import React, { useState, useEffect, useRef } from 'react';
import './DebugPanel.css';

const DebugPanel = ({ clickEvents = [], gameDebugMessages = [], apiEvents = [], clearClickEvents, clearGameDebugMessages, onForceDebugClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('click-events');
  const [localClickEvents, setLocalClickEvents] = useState([]);
  const [localDebugMessages, setLocalDebugMessages] = useState([]);
  const [localApiEvents, setLocalApiEvents] = useState([]);

  // References to containers
  const clickEventsRef = useRef(null);
  const gameDebugRef = useRef(null);
  const apiEventsRef = useRef(null);

  // Track visibility for debugging
  const [isVisible, setIsVisible] = useState(false);

  // Log props on every render to debug
  console.log('DebugPanel Props:', {
    clickEventsCount: clickEvents?.length || 0,
    gameDebugMessagesCount: gameDebugMessages?.length || 0,
    apiEventsCount: apiEvents?.length || 0,
    clickEvents,
    gameDebugMessages,
    apiEvents
  });

  // Ensure we have valid arrays even if the props are undefined or invalid
  useEffect(() => {
    if (Array.isArray(clickEvents)) {
      setLocalClickEvents(clickEvents);
    } else {
      console.warn("clickEvents prop is not an array:", clickEvents);
      setLocalClickEvents([]);
    }

    if (Array.isArray(gameDebugMessages)) {
      setLocalDebugMessages(gameDebugMessages);
    } else {
      console.warn("gameDebugMessages prop is not an array:", gameDebugMessages);
      setLocalDebugMessages([]);
    }

    if (Array.isArray(apiEvents)) {
      setLocalApiEvents(apiEvents);
    } else {
      console.warn("apiEvents prop is not an array:", apiEvents);
      setLocalApiEvents([]);
    }
  }, [clickEvents, gameDebugMessages, apiEvents]);

  // Direct DOM update for click events container when events change
  useEffect(() => {
    if (clickEventsRef.current && localClickEvents.length > 0) {
      // Update DOM directly to ensure visibility
      const content = localClickEvents.map((event, index) =>
        `<div key="${index}" class="click-event">${event}</div>`
      ).join('');

      clickEventsRef.current.innerHTML = content;
      console.log("DOM updated with click events:", content);
    }
  }, [localClickEvents]);

  // Direct DOM update for game debug container when events change
  useEffect(() => {
    if (gameDebugRef.current && localDebugMessages.length > 0) {
      // Update DOM directly to ensure visibility
      const content = localDebugMessages.map((message, index) =>
        `<div key="${index}" class="debug-message">${message}</div>`
      ).join('');

      gameDebugRef.current.innerHTML = content;
      console.log("DOM updated with debug messages:", content);
    }
  }, [localDebugMessages]);

  // Direct DOM update for API events container when events change
  useEffect(() => {
    if (apiEventsRef.current && localApiEvents.length > 0) {
      // Update DOM directly to ensure visibility
      const content = localApiEvents.map((event, index) =>
        `<div key="${index}" class="debug-message">${event}</div>`
      ).join('');

      apiEventsRef.current.innerHTML = content;
      console.log("DOM updated with API events:", content);
    }
  }, [localApiEvents]);

  // When expanded/collapsed state changes
  useEffect(() => {
    console.log("Debug panel expanded state changed:", isExpanded);
    setIsVisible(isExpanded);

    if (isExpanded) {
      // Force refresh the local state to show it's working
      const timestamp = new Date().toLocaleTimeString();
      const debugMessage = `${timestamp}: Debug panel expanded`;

      // Force add some test messages if containers are empty
      if (localClickEvents.length === 0) {
        const newEvent = `${timestamp}: Debug panel expanded - click events test`;
        setLocalClickEvents([newEvent]);

        if (clickEventsRef.current) {
          clickEventsRef.current.innerHTML = `<div class="click-event">${newEvent}</div>`;
        }
      }

      if (localDebugMessages.length === 0) {
        const newMessage = `${timestamp}: Debug panel expanded - debug messages test`;
        setLocalDebugMessages([newMessage]);

        if (gameDebugRef.current) {
          gameDebugRef.current.innerHTML = `<div class="debug-message">${newMessage}</div>`;
        }
      }

      if (localApiEvents.length === 0) {
        const newApiEvent = `${timestamp}: Debug panel expanded - API events test`;
        setLocalApiEvents([newApiEvent]);

        if (apiEventsRef.current) {
          apiEventsRef.current.innerHTML = `<div class="debug-message">${newApiEvent}</div>`;
        }
      }
    }
  }, [isExpanded, localClickEvents.length, localDebugMessages.length, localApiEvents.length]);

  const handleClearClickEvents = () => {
    setLocalClickEvents([]);
    if (clickEventsRef.current) {
      clickEventsRef.current.innerHTML = '<div class="no-events">No click events recorded yet</div>';
    }
    if (clearClickEvents) clearClickEvents();
  };

  const handleClearDebugMessages = () => {
    setLocalDebugMessages([]);
    if (gameDebugRef.current) {
      gameDebugRef.current.innerHTML = '<div class="no-events">No game debug messages recorded yet</div>';
    }
    if (clearGameDebugMessages) clearGameDebugMessages();
  };

  const handleClearApiEvents = () => {
    setLocalApiEvents([]);
    if (apiEventsRef.current) {
      apiEventsRef.current.innerHTML = '<div class="no-events">No API events recorded yet</div>';
    }
  };

  const handleForceDebugClick = () => {
    // Add a local entry to show it's working
    const timestamp = new Date().toLocaleTimeString();
    const newEvent = `${timestamp}: Force debug click button pressed`;

    setLocalClickEvents(prev => [newEvent, ...prev]);

    // Direct DOM update for immediate feedback
    if (clickEventsRef.current) {
      const currentContent = clickEventsRef.current.innerHTML;
      clickEventsRef.current.innerHTML = `<div class="click-event">${newEvent}</div>${currentContent}`;
    }

    if (onForceDebugClick) onForceDebugClick();
  };

  const handleSimulateApiEvent = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newEvent = `${timestamp}: [TEST] GET /api/test-endpoint (200ms)`;

    setLocalApiEvents(prev => [newEvent, ...prev]);

    // Direct DOM update for immediate feedback
    if (apiEventsRef.current) {
      const currentContent = apiEventsRef.current.innerHTML;
      apiEventsRef.current.innerHTML = `<div class="debug-message">${newEvent}</div>${currentContent}`;
    }
  };

  // Test message to immediately verify visibility
  const addTestMessage = () => {
    const timestamp = new Date().toLocaleTimeString();

    // Add to all tabs
    const clickEvent = `${timestamp}: VISIBILITY TEST - click event`;
    const debugMessage = `${timestamp}: VISIBILITY TEST - debug message`;
    const apiEvent = `${timestamp}: VISIBILITY TEST - API event`;

    // Update state
    setLocalClickEvents(prev => [clickEvent, ...prev]);
    setLocalDebugMessages(prev => [debugMessage, ...prev]);
    setLocalApiEvents(prev => [apiEvent, ...prev]);

    // Direct DOM updates
    if (clickEventsRef.current) {
      clickEventsRef.current.innerHTML = `<div class="click-event">${clickEvent}</div>` + clickEventsRef.current.innerHTML;
    }

    if (gameDebugRef.current) {
      gameDebugRef.current.innerHTML = `<div class="debug-message">${debugMessage}</div>` + gameDebugRef.current.innerHTML;
    }

    if (apiEventsRef.current) {
      apiEventsRef.current.innerHTML = `<div class="debug-message">${apiEvent}</div>` + apiEventsRef.current.innerHTML;
    }
  };

  const totalEventsCount = localClickEvents.length + localDebugMessages.length + localApiEvents.length;

  return (
    <div className={`debug-panel-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="debug-panel-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Hide Debug Panel' : 'Show Debug Panel'}
        {' '}
        <span className="debug-count-indicator">
          ({totalEventsCount} events)
        </span>
      </div>

      {isExpanded && (
        <div className="debug-panel-content">
          <div className="debug-tabs">
            <button
              className={`debug-tab ${activeTab === 'click-events' ? 'active' : ''}`}
              onClick={() => setActiveTab('click-events')}
            >
              Click Events ({localClickEvents.length})
            </button>
            <button
              className={`debug-tab ${activeTab === 'game-debug' ? 'active' : ''}`}
              onClick={() => setActiveTab('game-debug')}
            >
              Game Debug ({localDebugMessages.length})
            </button>
            <button
              className={`debug-tab ${activeTab === 'api-debug' ? 'active' : ''}`}
              onClick={() => setActiveTab('api-debug')}
            >
              API Debug ({localApiEvents.length})
            </button>
          </div>

          <div className="debug-panel-actions">
            <button
              className="debug-click-btn"
              onClick={handleForceDebugClick}
            >
              Force Debug Click
            </button>
            <button
              className="debug-clear-btn"
              onClick={() => {
                if (activeTab === 'click-events') {
                  handleClearClickEvents();
                } else if (activeTab === 'game-debug') {
                  handleClearDebugMessages();
                } else if (activeTab === 'api-debug') {
                  handleClearApiEvents();
                }
              }}
            >
              Clear Log
            </button>
            <button
              className="debug-click-btn"
              style={{ backgroundColor: '#28a745' }}
              onClick={addTestMessage}
            >
              Test Visibility
            </button>
          </div>

          <div className="debug-panel-tab-content">
            {activeTab === 'click-events' && (
              <div className="click-events-log">
                <h4>Click Events Log:</h4>
                <div className="events-container">
                  <div
                    ref={clickEventsRef}
                    className="events-inner-container"
                    style={{ minHeight: '120px', display: 'block' }}
                  >
                    {localClickEvents.length === 0 ? (
                      <div className="no-events">No click events recorded yet</div>
                    ) : (
                      <>
                        {localClickEvents.map((event, index) => (
                          <div key={index} className="click-event">{event}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'game-debug' && (
              <div className="game-debug-log">
                <h4>Game Debug Messages:</h4>
                <div className="events-container">
                  <div
                    ref={gameDebugRef}
                    className="events-inner-container"
                    style={{ minHeight: '120px', display: 'block' }}
                  >
                    {localDebugMessages.length === 0 ? (
                      <div className="no-events">No game debug messages recorded yet</div>
                    ) : (
                      <>
                        {localDebugMessages.map((message, index) => (
                          <div key={index} className="debug-message">{message}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api-debug' && (
              <div className="api-debug-container">
                <h4>API Events:</h4>
                <div className="events-container">
                  <div
                    ref={apiEventsRef}
                    className="events-inner-container"
                    style={{ minHeight: '120px', display: 'block' }}
                  >
                    {localApiEvents.length === 0 ? (
                      <div className="no-events">
                        <p>No API events recorded yet</p>
                        <button
                          className="debug-click-btn"
                          onClick={handleSimulateApiEvent}
                        >
                          Simulate API Event
                        </button>
                      </div>
                    ) : (
                      <>
                        {localApiEvents.map((event, index) => (
                          <div key={index} className="debug-message">{event}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {isVisible && <div className="debug-visibility-indicator">Debug panel visible: {localClickEvents.length} click events, {localDebugMessages.length} debug messages, {localApiEvents.length} API events</div>}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;