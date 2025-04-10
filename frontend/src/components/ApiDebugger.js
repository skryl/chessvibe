import React, { useState, useEffect } from 'react';
import './ApiDebugger.css';

// Global debug event system
export const debugEvents = {
  listeners: [],
  lastEvents: [],
  maxEvents: 10,

  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  emit(event) {
    this.lastEvents.unshift(event);
    this.lastEvents = this.lastEvents.slice(0, this.maxEvents);
    this.listeners.forEach(listener => listener(event));
  }
};

// Config for filtering events
const debugConfig = {
  showPollingRequests: false
};

// Export the debug config setter
export const setDebugConfig = (config) => {
  Object.assign(debugConfig, config);
};

// Function to check if an event is a polling request
const isPollingRequest = (event) => {
  if (event.type !== 'request' && event.type !== 'response') return false;

  // Check for polling flag directly from request/response config
  if (event.data?.isPollingRequest) {
    return true;
  }

  // Check if this is a GET request to a game or board endpoint
  const url = event.data?.url || '';
  const isGetRequest = event.data?.method === 'GET';

  // More specific patterns for game state polling
  if (!isGetRequest) return false;

  // Check for specific polling endpoint patterns:
  // 1. /games/{id} endpoint (get game state)
  // 2. /games/{id}/pretty endpoint (get pretty board)
  const isGameStateGet = /\/games\/\d+$/.test(url);
  const isPrettyBoardGet = /\/games\/\d+\/pretty$/.test(url);

  return isGameStateGet || isPrettyBoardGet;
};

// Export this for other parts of the app to use
export const logApiEvent = (type, data) => {
  const event = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    data
  };

  // Filter out polling requests if configured to do so
  if (!debugConfig.showPollingRequests && isPollingRequest(event)) {
    // Still log to console if it's an error
    if (type === 'error') {
      console.error(`🔴 API ${type} (filtered):`, data);
    }
    return; // Don't emit the event
  }

  debugEvents.emit(event);

  // Also log to console for browser DevTools
  if (type === 'error') {
    console.error(`🔴 API ${type}:`, data);
  } else {
    console.log(`🟢 API ${type}:`, data);
  }
};

const ApiDebugger = () => {
  const [events, setEvents] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [filterConfig, setFilterConfig] = useState(debugConfig);

  useEffect(() => {
    // On mount, get the existing events
    setEvents(debugEvents.lastEvents);

    // Subscribe to new events
    const unsubscribe = debugEvents.addListener(event => {
      setEvents(prev => [event, ...prev].slice(0, debugEvents.maxEvents));
      if (event.type === 'error') {
        setHasErrors(true);
      }
    });

    return unsubscribe;
  }, []);

  const clearEvents = () => {
    debugEvents.lastEvents = [];
    setEvents([]);
    setHasErrors(false);
  };

  const togglePollingRequests = () => {
    const newValue = !filterConfig.showPollingRequests;
    setFilterConfig(prev => ({ ...prev, showPollingRequests: newValue }));
    setDebugConfig({ showPollingRequests: newValue });
  };

  if (!expanded) {
    return (
      <div
        className={`api-debugger-toggle ${hasErrors ? 'has-errors' : ''}`}
        onClick={() => setExpanded(true)}
      >
        {hasErrors ? '⚠️ API Errors' : '🔍 API Debug'}
      </div>
    );
  }

  return (
    <div className="api-debugger">
      <div className="api-debugger-header">
        <h4>API Debug Console</h4>
        <div className="api-debugger-actions">
          <button onClick={clearEvents}>Clear</button>
          <button onClick={() => setExpanded(false)}>Close</button>
        </div>
      </div>

      <div className="api-debugger-filters">
        <label>
          <input
            type="checkbox"
            checked={filterConfig.showPollingRequests}
            onChange={togglePollingRequests}
          />
          Show Polling Requests
        </label>
      </div>

      <div className="api-debugger-events">
        {events.length === 0 ? (
          <div className="api-debugger-empty">No API events recorded yet</div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className={`api-event api-event-${event.type}`}
            >
              <div className="api-event-header">
                <span className="api-event-type">{event.type.toUpperCase()}</span>
                <span className="api-event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.type === 'request' && (
                <div className="api-event-details">
                  <div className="api-event-url">
                    <b>{event.data.method}</b> {event.data.url}
                  </div>
                  {event.data.data && (
                    <pre className="api-event-body">
                      {JSON.stringify(event.data.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              {event.type === 'response' && (
                <div className="api-event-details">
                  <div className="api-event-status">
                    Status: <b>{event.data.status}</b> {event.data.statusText}
                  </div>
                  <div className="api-event-url">{event.data.url}</div>
                  {event.data.duration && (
                    <div className="api-event-duration">
                      Duration: {event.data.duration}
                    </div>
                  )}
                  <pre className="api-event-body">
                    {JSON.stringify(event.data.data, null, 2)}
                  </pre>
                </div>
              )}
              {event.type === 'error' && (
                <div className="api-event-details">
                  <div className="api-event-url">Error: {event.data.message}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiDebugger;