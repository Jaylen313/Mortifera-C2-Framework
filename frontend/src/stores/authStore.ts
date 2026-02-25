/**
 * Authentication Store
 * 
 * Uses Zustand for state management.
 * Stores current user and authentication state.
 */

import { create } from 'zustand';
import { authApi } from '../lib/api';
import type { User, LoginCredentials } from '../types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ============================================
  // INITIAL STATE
  // ============================================
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ============================================
  // LOGIN
  // ============================================
  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      // Call login API
      const response = await authApi.login(credentials);

      // Save token and user to localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update state
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  // ============================================
  // LOGOUT
  // ============================================
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    // Clear state
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ============================================
  // LOAD USER (from localStorage or API)
  // ============================================
  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    // First, load from localStorage
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true });
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem('user');
      }
    }

    // Then, verify with API
    try {
      const user = await authApi.me();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      // Token is invalid, logout
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // ============================================
  // CLEAR ERROR
  // ============================================
  clearError: () => {
    set({ error: null });
  },
}));