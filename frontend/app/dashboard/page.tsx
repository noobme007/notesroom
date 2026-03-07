'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import { CreateRoomModal, JoinRoomModal } from '@/components/modals/RoomModals';
import {
  FiPlus,
  FiLogIn,
  FiBookOpen,
  FiCopy,
  FiLogOut,
  FiLoader,
  FiChevronRight,
  FiShield,
  FiEdit3,
  FiEye,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { rooms, loading: roomsLoading, createRoom, joinRoom, deleteRoom } = useRooms(user?._id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  const handleCreateRoom = async (roomName: string) => {
    try {
      const room = await createRoom(roomName);
      toast.success(`Room created! Code: ${room.roomCode}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create room');
      throw err;
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      const result = await joinRoom(roomCode);
      toast.success(result.message || 'Joined room successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to join room');
      throw err;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied!');
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-3.5 h-3.5 text-yellow-400" />;
      case 'editor':
        return <FiEdit3 className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <FiEye className="w-3.5 h-3.5 text-dark-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBookOpen className="w-6 h-6 text-primary-400" />
            <span className="text-lg font-bold text-white">
              StudyRoom<span className="text-primary-400"> AI (Updated)</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-medium text-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="text-dark-200 text-sm hidden sm:block">{user.name}</span>
            <button onClick={signOut} className="btn-ghost text-sm flex items-center gap-1">
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-dark-400 mt-1">Your study rooms</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiLogIn className="w-4 h-4" />
              Join Room
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>

        {/* Room Cards */}
        {roomsLoading ? (
          <div className="flex items-center justify-center py-16">
            <FiLoader className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="card text-center py-16">
            <FiBookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
            <p className="text-dark-400 mb-6">
              Create a new room or join one with a code to get started.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowJoinModal(true)} className="btn-secondary">
                Join Room
              </button>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => router.push(`/room/${room._id}`)}
                className="card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg truncate flex-1">
                    {room.roomName}
                  </h3>
                  <FiChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(room.roomCode);
                    }}
                    className="flex items-center gap-1.5 bg-dark-700/50 text-dark-300 hover:text-white px-2.5 py-1 rounded-md text-sm font-mono transition-colors"
                    title="Copy room code"
                  >
                    <FiCopy className="w-3 h-3" />
                    {room.roomCode}
                  </button>
                  <div className="flex items-center gap-1 text-xs capitalize">
                    {getRoleIcon(room.role)}
                    <span className="text-dark-400">{room.role}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-dark-500 text-xs mt-1">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                  </p>

                  {room.role === 'admin' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Are you sure you want to completely delete "${room.roomName}"? This action cannot be undone.`)) return;
                        try {
                          await deleteRoom(room._id);
                          toast.success('Room deleted successfully!');
                        } catch (err: any) {
                          toast.error('Failed to delete room');
                        }
                      }}
                      className="text-dark-600 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-all z-10"
                      title="Delete Room"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinRoom}
      />
    </div>
  );
}
