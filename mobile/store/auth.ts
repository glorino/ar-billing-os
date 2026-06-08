import { create } from 'zustand';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, user: User) => {
    await setAuthToken(token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await clearAuthToken();
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  loadToken: async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
