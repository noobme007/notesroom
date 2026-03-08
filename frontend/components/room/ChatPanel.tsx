'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare, FiFile, FiEye, FiDownload, FiLoader } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/hooks/useChat';
import { ChatMessage, FileReference } from '@/types';

interface ChatPanelProps {
  roomId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatPanel({ roomId, isOpen, onToggle }: ChatPanelProps) {
  const { messages, loading, sending, error, sendMessage, messagesEndRef, scrollToBottom } =
    useChat(roomId);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const msg = input;
    setInput('');
    try {
      await sendMessage(msg);
    } catch {
      setInput(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-4 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-600/25 transition-all z-40"
        title="Open AI Chat"
      >
        <FiMessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`
      fixed inset-y-0 right-0 z-[60] md:z-20 md:relative w-full md:w-96
      bg-dark-900/95 md:bg-dark-900/80 backdrop-blur-xl md:backdrop-blur-sm
      border-l border-dark-700 flex flex-col h-full shadow-2xl transition-transform duration-500 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full md:hidden'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce-subtle shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
          <h3 className="text-white font-bold tracking-tight">Cerebrum Assistant</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-dark-400 hover:text-white p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageSquare className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">
              Ask me about your notes!
            </p>
            <div className="mt-4 space-y-2">
              {[
                'Find Unit 3 notes',
                'Explain backpropagation',
                'Summarize the uploaded files',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-sm text-dark-300 hover:text-primary-400 bg-dark-800 hover:bg-dark-700 rounded-lg px-3 py-2 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg._id} message={msg} />
          ))
        )}

        {sending && (
          <div className="flex items-center gap-2 text-dark-400 text-sm">
            <FiLoader className="w-4 h-4 animate-spin" />
            AI is thinking...
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-dark-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes..."
            className="input-field text-sm py-2 resize-none"
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="btn-primary p-2.5 flex-shrink-0"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="space-y-2 animate-slide-up">
      {/* User message */}
      <div className="flex justify-end">
        <div className="bg-primary-600/20 border border-primary-500/30 rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
          <p className="text-sm text-white">{message.message}</p>
        </div>
      </div>

      {/* AI response */}
      <div className="flex justify-start">
        <div className="bg-dark-800 border border-dark-700 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
          <div className="text-sm text-dark-200 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.response}</ReactMarkdown>
          </div>

          {/* File references */}
          {message.fileReferences && message.fileReferences.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dark-600 space-y-1">
              {message.fileReferences.map((ref: FileReference) => (
                <div
                  key={ref.fileId}
                  className="flex items-center gap-2 text-xs bg-dark-700/50 rounded-lg px-2 py-1.5"
                >
                  <FiFile className="w-3 h-3 text-primary-400 flex-shrink-0" />
                  <span className="text-dark-300 truncate flex-1">{ref.fileName}</span>
                  <a
                    href={ref.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                    title="Preview"
                  >
                    <FiEye className="w-3 h-3" />
                  </a>
                  <a
                    href={ref.fileUrl}
                    download
                    className="text-green-400 hover:text-green-300"
                    title="Download"
                  >
                    <FiDownload className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
