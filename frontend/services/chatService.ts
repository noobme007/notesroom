import api from './api';
import { ChatMessage, PaginationInfo } from '@/types';

export const chatService = {
  /**
   * Send a chat message and get AI response.
   */
  async sendMessage(roomId: string, message: string): Promise<ChatMessage> {
    const { data } = await api.post(`/rooms/${roomId}/chat`, { message });
    return data.chatMessage;
  },

  /**
   * Get chat history for a room.
   */
  async getChatHistory(
    roomId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: ChatMessage[]; pagination: PaginationInfo }> {
    const { data } = await api.get(`/rooms/${roomId}/chat/history`, {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Clear chat history for a user in a room.
   */
  async clearChatHistory(roomId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/chat/history`);
  },
};
