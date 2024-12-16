import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000';

export const useAuthStore = create((set, get) => ({
    authUser: JSON.parse(localStorage.getItem('authUser')) || null, // Initialize from localStorage
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingUp: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data });
            localStorage.setItem('authUser', JSON.stringify(res.data)); // Persist authUser
            get().connectSocket();
        } catch (error) {

            set({ authUser: null });
            localStorage.removeItem('authUser'); // Clear storage on failure
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            toast.success('Account created successfully');
            set({ authUser: response.data });
            localStorage.setItem('authUser', JSON.stringify(response.data)); // Persist authUser
            get().connectSocket();
        } catch (error) {
            console.log(error);
            toast.error('Failed to create account');
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            localStorage.removeItem('authUser'); // Remove authUser from storage
            toast.success('Logged out successfully');
            get().disconnectSocket();
        } catch (error) {
            console.log(error);
            toast.error('Failed to logout');
        }
    },

    login: async (data) => {
        try {
            set({ isLoggingUp: true });
            const response = await axiosInstance.post('/auth/login', data);
            set({ authUser: response.data });
            localStorage.setItem('authUser', JSON.stringify(response.data)); // Persist authUser
            toast.success('Logged in successfully');
            get().connectSocket();
        } catch (error) {
            console.log(error);
            toast.error('Failed to login');
        } finally {
            set({ isLoggingUp: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            const updatedUser = res.data;

            set((state) => ({
                authUser: {
                    ...state.authUser,
                    ExUser: {
                        ...state.authUser.ExUser,
                        ...updatedUser, // Update the user data with the response
                    },
                },
            }));
            localStorage.removeItem('authUser'); // Remove authUser from storage

            localStorage.setItem('authUser', JSON.stringify(get().authUser)); // Persist updated user in localStorage
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },


    connectSocket: async () => {
        const { authUser } = get();

        if (!authUser) return; // Return if user is not authenticated

        const socket = io(BASE_URL, {
            query: { userId: authUser._id }, // Passing user ID to the server
        });

        socket.connect();
        set({ socket: socket });

        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

    setOnlineUsers: (newOnlineUsers) => {
        set({ onlineUsers: newOnlineUsers })
    }
}));
