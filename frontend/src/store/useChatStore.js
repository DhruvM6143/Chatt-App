import { create } from 'zustand'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'

import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
    messages: [],

    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isImageUploading: false,

    getUsers: async () => {
        set({ isUsersLoading: true })
        try {
            const res = await axiosInstance.get('/messages/users')
            set({ users: res.data.filteredUsers })



        } catch (error) {
            console.log(error);
            toast.error('Failed to load users')

        }
        finally {
            set({ isUsersLoading: false })
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data.messages })



        } catch (error) {
            toast.error(error)
        }
        finally {
            set({ isMessagesLoading: false })
        }
    },


    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        try {
            set({ isImageUploading: true });
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data.newMessage] })




        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            set({ isImageUploading: false });
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket



        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId !== selectedUser._id
            if (isMessageSentFromSelectedUser) return
            set({ messages: [...get().messages, newMessage] })
        })

    },
    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")

    },




    setSelectedUser: (selectedUser) => set({ selectedUser }),
    setUsers: (newUser) => set((state) => ({ users: [...state.users, newUser] })),


}))

