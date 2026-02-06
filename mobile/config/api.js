import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator use: http://10.0.2.2:3000/api
// For real device replace with your computer's IP address (e.g. http://192.168.x.x:3000/api)
// For iOS emulator or web use: http://localhost:3000/api

// Automatic detection for Android emulator
// For real device replace with your computer's IP address (e.g. http://192.168.0.236:3000/api)
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // For Android emulator use 10.0.2.2
    // For real Android device replace with your computer's IP address (e.g. 'http://192.168.0.236:3000/api')
    return 'http://10.0.2.2:3000/api';
  }
  // For iOS emulator or web use localhost
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseURL();

// Helper function to build URL with query params
const buildUrl = (endpoint, params = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  const queryParams = [];
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  });
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  return url;
};

// Main API function
const api = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle token expiration
      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw { 
          response: { 
            data: { error: `Invalid response from server. Status: ${response.status}` }, 
            status: response.status 
          } 
        };
      }

      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }

      return { data };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      // More detailed error information
      const errorMessage = error.message || 'Cannot connect to server';
      console.error('API Error:', errorMessage, 'URL:', `${API_BASE_URL}${endpoint}`);
      throw { 
        response: { 
          data: { 
            error: `Network error: ${errorMessage}. Make sure backend is running at ${API_BASE_URL}` 
          }, 
          status: 0 
        } 
      };
    }
  },

  async get(endpoint, params = {}) {
    const url = buildUrl(endpoint, params);
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw { 
          response: { 
            data: { error: `Invalid response from server. Status: ${response.status}` }, 
            status: response.status 
          } 
        };
      }

      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }

      return { data };
    } catch (error) {
      if (error.response) {
        throw error;
      }
      // More detailed error information
      const errorMessage = error.message || 'Cannot connect to server';
      console.error('API Error:', errorMessage, 'URL:', url);
      throw { 
        response: { 
          data: { 
            error: `Network error: ${errorMessage}. Make sure backend is running at ${API_BASE_URL}` 
          }, 
          status: 0 
        } 
      };
    }
  },

  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

export default api;
