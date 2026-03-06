'use client';

import { useState, useEffect, useCallback } from 'react';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roomService.listRooms();
      setRooms(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (roomName: string) => {
    const room = await roomService.createRoom(roomName);
    setRooms((prev) => [...prev, { ...room, role: 'admin' }]);
    return room;
  };

  const joinRoom = async (roomCode: string) => {
    const result = await roomService.joinRoom(roomCode);
    await fetchRooms();
    return result;
  };

  return { rooms, loading, error, createRoom, joinRoom, refetch: fetchRooms };
}
