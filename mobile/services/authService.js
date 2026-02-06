import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async register(email, password, firstName, lastName) {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async getStoredUser() {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
