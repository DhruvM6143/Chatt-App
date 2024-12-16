import React, { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import SideBarSkeleton from './Skeleton/SideBarSkeleton'
import { Users } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { io } from 'socket.io-client'
const socket = io('http://localhost:5000')
const Sidebar = () => {
    const { users, getUsers, setUsers, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
    const { onlineUsers, setOnlineUsers } = useAuthStore()

    const [showOnline, setShowOnline] = useState(false)

    useEffect(() => {
        getUsers(); // Fetch initial users
    }, [getUsers]);

    useEffect(() => {
        socket.on('new-user', (newUser) => {
            // Update users state with the new user
            setUsers(newUser);
        });

        socket.on('userStatusChanged', (updatedOnlineUsers) => {
            // Update online users state
            setOnlineUsers(updatedOnlineUsers);
        });

        return () => {
            // Cleanup listeners
            socket.off('new-user');
            socket.off('userStatusChanged');
            socket.off('newMessage');
        };
    }, [setUsers, setOnlineUsers]);


    const filteredUsers = users
        .filter((user) => (showOnline ? onlineUsers.includes(user._id) : true))
        .sort((a, b) => {

            const isAOnline = onlineUsers.includes(a._id);
            const isBOnline = onlineUsers.includes(b._id);
            if (isAOnline && !isBOnline) return -1;
            if (!isAOnline && isBOnline) return 1;


            const aLastMessage = a.lastMessage?.timestamp || 0;
            const bLastMessage = b.lastMessage?.timestamp || 0;
            if (aLastMessage !== bLastMessage) return bLastMessage - aLastMessage;


            return a.fullName.localeCompare(b.fullName);
        });





    if (isUsersLoading) return <SideBarSkeleton />



    return (
        <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200'>
            <div className='border-b border-base-300 w-full p-5 '>
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>

                {/* Todod online filter toggle */}
                <div className="mt-3 hidden lg:flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnline}
                            onChange={(e) => setShowOnline(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>

            </div>
            <div className='overflow-y-auto w-full py-3'>
                {
                    filteredUsers.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`
                          w-full p-3 flex items-center gap-3
                          hover:bg-base-300 transition-colors
                          ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                        `}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.name}
                                    className="size-12 object-cover rounded-full"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span
                                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                              rounded-full ring-2 ring-zinc-900"
                                    />
                                )}
                            </div>

                            {/* User info - only visible on larger screens */}
                            <div className="hidden lg:block text-left min-w-0">
                                <div className="font-medium truncate">{user.fullName}</div>
                                <div className="text-sm text-zinc-400">
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))
                }
                {filteredUsers.length === 0 && (
                    <div className="text-center text-zinc-500 py-4">No online users</div>
                )}
            </div>
        </aside>
    )
}

export default Sidebar