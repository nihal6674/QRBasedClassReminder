import { create } from 'zustand';
import * as authService from '@services/authService';

const useAuthStore = create((set, get) => ({
    // State
    admin: null,
    isAuthenticated: false,
    isLoading: true, // True initially to check auth on load
    error: null,

    // Actions
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(email, password);
            const admin = response.data?.admin || response.admin;
            // Store tokens in localStorage for iOS Safari Bearer-token fallback
            const tokens = response.data?.tokens || response.tokens;
            if (tokens?.accessToken) {
                localStorage.setItem('access_token', tokens.accessToken);
            }
            if (tokens?.refreshToken) {
                localStorage.setItem('refresh_token', tokens.refreshToken);
            }
            set({
                admin,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return { success: true, admin };
        } catch (error) {
            set({
                admin: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.message || 'Login failed',
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch (error) {
            // Ignore logout errors
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({
                admin: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await authService.getProfile();
            const admin = response.data?.admin || response.admin;
            set({
                admin,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return true;
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({
                admin: null,
                isAuthenticated: false,
                isLoading: false,
                error: null, // Don't show error for auth check
            });
            return false;
        }
    },

    clearError: () => set({ error: null }),

    // Getters
    getAdmin: () => get().admin,
    getIsAuthenticated: () => get().isAuthenticated,
}));

export default useAuthStore;
