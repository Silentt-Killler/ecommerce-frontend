import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,  // Start with true
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Get user profile
          const userResponse = await api.get('/users/me');
          
          set({ 
            user: userResponse.data, 
            isAuthenticated: true, 
            isLoading: false,
            isInitialized: true
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false, isInitialized: true });
          return { 
            success: false, 
            error: error.response?.data?.detail || 'Login failed' 
          };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { 
            name, 
            email, 
            password 
          });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Get user profile
          const userResponse = await api.get('/users/me');
          
          set({ 
            user: userResponse.data, 
            isAuthenticated: true, 
            isLoading: false,
            isInitialized: true
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false, isInitialized: true });
          return { 
            success: false, 
            error: error.response?.data?.detail || 'Registration failed' 
          };
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false, isInitialized: true });
          return;
        }
        
        try {
          const response = await api.get('/users/me');
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false,
            isInitialized: true
          });
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
      },

      initialize: async () => {
        const { isInitialized } = get();
        if (isInitialized) return;
        
        await get().checkAuth();
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check auth
        if (state) {
          state.isLoading = true;
          state.checkAuth();
        }
      }
    }
  )
);

export default useAuthStore;
