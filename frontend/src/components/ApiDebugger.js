import React, { useState, useEffect } from 'react';
import './ApiDebugger.css';

// Global debug event system
const debugEvents = {
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

// Export this for other parts of the app to use
export const logApiEvent = (type, data) => {
  const event = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    data
  };
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
        <h3>API Debug</h3>
        <div className="api-debugger-actions">
          <button onClick={clearEvents}>Clear</button>
          <button onClick={() => setExpanded(false)}>Close</button>
        </div>
      </div>

      <div className="api-debugger-content">
        {events.length === 0 ? (
          <div className="no-events">No API events recorded</div>
        ) : (
          events.map(event => (
            <div key={event.id} className={`event ${event.type}`}>
              <div className="event-header">
                <span className="event-type">{event.type.toUpperCase()}</span>
                <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <pre className="event-data">{JSON.stringify(event.data, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiDebugger;