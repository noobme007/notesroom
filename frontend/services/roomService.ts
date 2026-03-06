import api from './api';
import { Room, RoomMember } from '@/types';

export const roomService = {
  /**
   * Create a new room.
   */
  async createRoom(roomName: string): Promise<Room> {
    const { data } = await api.post('/rooms', { roomName });
    return data.room;
  },

  /**
   * Join a room by code.
   */
  async joinRoom(roomCode: string): Promise<{ room: Room; message: string }> {
    const { data } = await api.post('/rooms/join', { roomCode });
    return data;
  },

  /**
   * List all rooms the user is a member of.
   */
  async listRooms(): Promise<Room[]> {
    const { data } = await api.get('/rooms');
    return data.rooms;
  },

  /**
   * Get room details.
   */
  async getRoom(roomId: string): Promise<Room> {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data.room;
  },

  /**
   * List room members.
   */
  async listMembers(roomId: string): Promise<RoomMember[]> {
    const { data } = await api.get(`/rooms/${roomId}/members`);
    return data.members;
  },

  /**
   * Update a member's role.
   */
  async updateMemberRole(roomId: string, userId: string, role: string): Promise<void> {
    await api.put(`/rooms/${roomId}/members/${userId}`, { role });
  },

  /**
   * Remove a member from the room.
   */
  async removeMember(roomId: string, userId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/members/${userId}`);
  },
};
