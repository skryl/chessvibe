import axios from 'axios';
import { logApiEvent } from '../components/ApiDebugger';

// Backend API URL - ensure this matches the backend server port
const API_URL = 'http://localhost:4567/api';

// Add a flag to determine if we're in debug mode
const DEBUG_MODE = true;

// Create a custom axios instance for debugging
const debugAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug config for filtering requests
const debugConfig = { showPollingRequests: false };

// Function to update debug config
export const updateApiDebugConfig = (config) => {
  Object.assign(debugConfig, config);
};

// Add request interceptor
debugAxios.interceptors.request.use(
  config => {
    if (DEBUG_MODE) {
      console.log('🚀 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
        isPolling: !!config.isPollingRequest
      });
    }

    // Log to our debugger (only if it's not a polling request or we want to show polling)
    if (!config.isPollingRequest || debugConfig.showPollingRequests) {
      logApiEvent('request', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        isPollingRequest: !!config.isPollingRequest
      });
    }

    // Add a timestamp to the request for debugging
    config.metadata = { startTime: new Date() };

    // Mark game state polling requests
    const url = config.url || '';
    const isGetMethod = config.method === 'get';

    if (isGetMethod) {
      // Check for game state and pretty board polling patterns
      if (/\/games\/\d+$/.test(url) || /\/games\/\d+\/pretty$/.test(url)) {
        config = markAsPolling(config);
      }
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    logApiEvent('error', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Add response interceptor
debugAxios.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = response.config.metadata ?
      new Date() - response.config.metadata.startTime :
      null;

    // Check if this is a polling request
    const isPollingRequest = !!response.config.isPollingRequest;

    if (DEBUG_MODE) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        duration: duration ? `${duration}ms` : 'Unknown',
        data: response.data,
        isPolling: isPollingRequest
      });
    }

    // Log to our debugger (only if it's not a polling request or we want to show polling)
    if (!isPollingRequest || debugConfig.showPollingRequests) {
      logApiEvent('response', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        duration: duration ? `${duration}ms` : 'Unknown',
        data: response.data,
        isPollingRequest: isPollingRequest
      });
    }

    return response;
  },
  error => {
    if (error.response) {
      console.error('❌ Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data
      });

      // Log to our debugger
      logApiEvent('error', {
        type: 'response',
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ Request Error:', {
        message: 'No response received',
        url: error.config?.url
      });

      // Log to our debugger
      logApiEvent('error', {
        type: 'request',
        message: 'No response received',
        url: error.config?.url
      });
    } else {
      console.error('❌ Error:', error.message);

      // Log to our debugger
      logApiEvent('error', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return Promise.reject(error);
  }
);

// Add a simple debug function that can be called directly
const debugLog = (message, data) => {
  if (DEBUG_MODE) {
    console.log(`🔍 API Debug: ${message}`, data);
  }
};

// Add isPollingRequest flag to specific API methods
const markAsPolling = (config) => {
  config.isPollingRequest = true;
  return config;
};

// Make specific polling API methods
const getGame = async (gameId, isPolling = false) => {
  const config = isPolling ? { isPollingRequest: true } : {};
  debugLog(`Getting game data for game ${gameId}${isPolling ? ' (polling)' : ''}`);
  const response = await debugAxios.get(`${API_URL}/games/${gameId}`, config);
  return response.data;
};

const getPrettyBoard = async (gameId, isPolling = false) => {
  const config = isPolling ? { isPollingRequest: true } : {};
  const response = await debugAxios.get(`${API_URL}/games/${gameId}/pretty`, config);
  return response.data;
};

const api = {
  // Debug methods
  debug: {
    log: debugLog,
    testConnection: async () => {
      try {
        debugLog('Testing API connection');
        const start = new Date();

        // First try the ping endpoint
        try {
          const response = await debugAxios.get(`${API_URL}/ping`);
          const duration = new Date() - start;
          debugLog(`API ping successful (${duration}ms)`, response.data);
          return { success: true, data: response.data, duration };
        } catch (pingError) {
          // If ping fails, try getting users as a fallback
          debugLog('Ping endpoint failed, trying users endpoint', pingError);
          const usersResponse = await debugAxios.get(`${API_URL}/users`);
          const duration = new Date() - start;
          debugLog(`API users endpoint successful (${duration}ms)`, usersResponse.data);
          return {
            success: true,
            data: { message: "Used fallback endpoint", users: usersResponse.data },
            duration,
            warning: "Ping endpoint not available"
          };
        }
      } catch (error) {
        debugLog('API connection test failed', error);
        return { success: false, error };
      }
    },

    getApiInfo: async () => {
      try {
        debugLog('Getting API server info');
        const response = await debugAxios.get(`${API_URL}/info`);
        return { success: true, data: response.data };
      } catch (error) {
        debugLog('Failed to get API info', error);
        return { success: false, error };
      }
    }
  },

  // Direct ping endpoint
  ping: async () => {
    try {
      const response = await debugAxios.get(`${API_URL}/ping`);
      return response.data;
    } catch (error) {
      console.error('Ping failed:', error);
      throw error;
    }
  },

  // User-related endpoints
  getUsers: async () => {
    const response = await debugAxios.get(`${API_URL}/users`);
    return response.data;
  },

  getUser: async (userId) => {
    const response = await debugAxios.get(`${API_URL}/users/${userId}`);
    return response.data;
  },

  createUser: async (username) => {
    const response = await debugAxios.post(`${API_URL}/users`, { username });
    return response.data;
  },

  getUserRatingHistory: async (userId) => {
    const response = await debugAxios.get(`${API_URL}/users/${userId}/rating_history`);
    return response.data;
  },

  // Game-related endpoints
  getGames: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_URL}/games?${queryParams}` : `${API_URL}/games`;
    const response = await debugAxios.get(url);
    return response.data;
  },

  // Using the getGame function we defined above
  getGame,

  createGame: async (whitePlayerId, blackPlayerId) => {
    const response = await debugAxios.post(`${API_URL}/games`, {
      white_player_id: whitePlayerId,
      black_player_id: blackPlayerId
    });
    return response.data;
  },

  makeMove: async (gameId, playerId, fromPosition, toPosition, promotionPiece = null) => {
    debugLog(`Making move in game ${gameId}`, { playerId, fromPosition, toPosition });

    const data = {
      player_id: playerId,
      from_position: fromPosition,
      to_position: toPosition
    };

    if (promotionPiece) {
      data.promotion_piece = promotionPiece;
    }

    const response = await debugAxios.post(`${API_URL}/games/${gameId}/moves`, data);
    return response.data;
  },

  getLegalMoves: async (gameId, position) => {
    debugLog(`Getting legal moves for ${position} in game ${gameId}`);
    const response = await debugAxios.get(`${API_URL}/games/${gameId}/legal_moves/${position}`);
    return response.data;
  },

  getMoves: async (gameId) => {
    const response = await debugAxios.get(`${API_URL}/games/${gameId}/moves`);
    return response.data;
  },

  // Using the getPrettyBoard function we defined above
  getPrettyBoard,

  completeGame: async (gameId, result) => {
    const response = await debugAxios.post(`${API_URL}/games/${gameId}/complete`, { result });
    return response.data;
  }
};

export default api;