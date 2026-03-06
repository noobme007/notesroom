'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chatService';
import { ChatMessage } from '@/types';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const { messages: history } = await chatService.getChatHistory(roomId);
      setMessages(history);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || sending) return;
    try {
      setSending(true);
      const chatMessage = await chatService.sendMessage(roomId, message);
      setMessages((prev) => [...prev, chatMessage]);
      setError(null);
      return chatMessage;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
    refetch: fetchHistory,
  };
}
