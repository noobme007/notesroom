'use client';

import React, { useState } from 'react';
import { FiPlus, FiLogIn } from 'react-icons/fi';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomName: string) => Promise<void>;
}

export function CreateRoomModal({ isOpen, onClose, onSubmit }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      await onSubmit(roomName.trim());
      setRoomName('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card max-w-md w-full mx-4 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiPlus className="text-primary-400" />
          Create New Room
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark-300 text-sm font-medium mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., AI ML Notes"
              className="input-field"
              autoFocus
              maxLength={100}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading || !roomName.trim()} className="btn-primary">
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomCode: string) => Promise<void>;
}

export function JoinRoomModal({ isOpen, onClose, onSubmit }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setLoading(true);
    try {
      await onSubmit(roomCode.trim().toUpperCase());
      setRoomCode('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card max-w-md w-full mx-4 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiLogIn className="text-primary-400" />
          Join Room
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark-300 text-sm font-medium mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g., 7KJ92L"
              className="input-field tracking-widest text-center text-lg font-mono"
              autoFocus
              maxLength={6}
            />
            <p className="text-dark-400 text-sm mt-2">
              Enter the 6-character room code shared with you.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || roomCode.trim().length !== 6}
              className="btn-primary"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
