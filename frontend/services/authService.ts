import api from './api';
import { User } from '@/types';

export const authService = {
  /**
   * Authenticate with Google token and get/create user.
   */
  async googleAuth(): Promise<User> {
    const { data } = await api.post('/auth/google');
    return data.user;
  },

  /**
   * Get current authenticated user.
   */
  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};
