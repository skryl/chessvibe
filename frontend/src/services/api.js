import axios from 'axios';
import { logApiEvent } from '../components/ApiDebugger';

// Backend API URL - ensure this matches the backend server port
const API_URL = 'http://localhost:4567/api';

// Create a custom axios instance for debugging
const debugAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
debugAxios.interceptors.request.use(
  config => {
    console.log('🚀 API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    });

    // Log to our debugger
    logApiEvent('request', {
      method: config.method.toUpperCase(),
      url: config.url,
      data: config.data
    });

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
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });

    // Log to our debugger
    logApiEvent('response', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });

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

const api = {
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

  getGame: async (gameId) => {
    const response = await debugAxios.get(`${API_URL}/games/${gameId}`);
    return response.data;
  },

  createGame: async (whitePlayerId, blackPlayerId) => {
    const response = await debugAxios.post(`${API_URL}/games`, {
      white_player_id: whitePlayerId,
      black_player_id: blackPlayerId
    });
    return response.data;
  },

  makeMove: async (gameId, playerId, fromPosition, toPosition, promotionPiece = null) => {
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
    const response = await debugAxios.get(`${API_URL}/games/${gameId}/legal_moves/${position}`);
    return response.data;
  },

  getMoves: async (gameId) => {
    const response = await debugAxios.get(`${API_URL}/games/${gameId}/moves`);
    return response.data;
  },

  getPrettyBoard: async (gameId) => {
    const response = await debugAxios.get(`${API_URL}/games/${gameId}/pretty`);
    return response.data;
  },

  completeGame: async (gameId, result) => {
    const response = await debugAxios.post(`${API_URL}/games/${gameId}/complete`, { result });
    return response.data;
  }
};

export default api;