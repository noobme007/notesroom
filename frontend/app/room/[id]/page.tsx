'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFolders } from '@/hooks/useFolders';
import { useFiles } from '@/hooks/useFiles';
import { FolderSidebar } from '@/components/room/FolderSidebar';
import { FileList } from '@/components/room/FileList';
import { ChatPanel } from '@/components/room/ChatPanel';
import { MembersPanel } from '@/components/room/MembersPanel';
import { FileUploadModal } from '@/components/modals/FileUploadModal';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { roomService } from '@/services/roomService';
import { Room, FileItem, RoomRole } from '@/types';
import {
  FiArrowLeft,
  FiUsers,
  FiCopy,
  FiMessageSquare,
  FiLoader,
  FiBookOpen,
  FiTrash2,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface RoomPageProps {
  params: { id: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  const roomId = params.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => { },
  });

  const { folders, createFolder, deleteFolder } = useFolders(roomId);
  const { files, loading: filesLoading, uploadFile, deleteFile } = useFiles(selectedFolderId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user && roomId) {
      loadRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, roomId]);

  const loadRoom = async () => {
    try {
      setLoadingRoom(true);
      const data = await roomService.getRoom(roomId);
      setRoom(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load room');
      router.push('/dashboard');
    } finally {
      setLoadingRoom(false);
    }
  };

  if (authLoading || loadingRoom || !user || !room) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  const userRole = (room.role || 'viewer') as RoomRole;
  const selectedFolder = folders.find((f) => f._id === selectedFolderId);

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      toast.success('File uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
      throw err;
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete File',
      message: 'Are you sure you want to delete this file? This action cannot be undone.',
      confirmText: 'Delete File',
      onConfirm: async () => {
        try {
          await deleteFile(fileId);
          toast.success('File deleted');
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Delete failed');
        }
      },
    });
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      toast.success('Folder created');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create folder');
      throw err;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f._id === folderId);
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folder?.folderName}"? All files inside will be lost.`,
      confirmText: 'Delete Folder',
      onConfirm: async () => {
        try {
          await deleteFolder(folderId);
          if (selectedFolderId === folderId) setSelectedFolderId(null);
          toast.success('Folder deleted');
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Failed to delete folder');
        }
      },
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast.success('Room code copied!');
  };

  const handleDeleteRoom = async () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Study Room',
      message: `Are you sure you want to completely delete "${room.roomName}"? This action is permanent and cannot be undone.`,
      confirmText: 'Delete Everything',
      onConfirm: async () => {
        try {
          await roomService.deleteRoom(roomId);
          toast.success('Room deleted successfully');
          router.push('/dashboard');
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Failed to delete room');
        }
      },
    });
  };

  return (
    <div className="h-screen bg-dark-950 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-dark-400 hover:text-white p-1 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden text-dark-400 hover:text-white p-1 transition-colors"
          >
            {mobileSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          <FiBookOpen className="w-5 h-5 text-primary-400 hidden sm:block" />
          <h1 className="text-white font-semibold truncate max-w-[120px] sm:max-w-none">{room.roomName}</h1>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 bg-dark-800 text-dark-300 hover:text-white px-2 py-0.5 rounded text-xs font-mono transition-colors"
            title="Copy room code"
          >
            <FiCopy className="w-3 h-3" />
            <span className="hidden xs:inline">{room.roomCode}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'admin' && (
            <button
              onClick={handleDeleteRoom}
              className="btn-ghost text-sm flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              title="Delete Room"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Room</span>
            </button>
          )}
          <button
            onClick={() => setMembersOpen(true)}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <FiUsers className="w-4 h-4" />
            <span className="hidden sm:inline">Members</span>
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`btn-ghost text-sm flex items-center gap-1.5 ${chatOpen ? 'text-primary-400' : ''
              }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Folder Sidebar */}
        <div className={`
          fixed md:relative z-30 md:z-auto h-full transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <FolderSidebar
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={(id) => {
              setSelectedFolderId(id);
              setMobileSidebarOpen(false);
            }}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            userRole={userRole}
            roomName={room.roomName}
          />
        </div>

        {/* File List - Main Area */}
        <FileList
          files={files}
          loading={filesLoading}
          selectedFolderId={selectedFolderId}
          folderName={selectedFolder?.folderName || ''}
          userRole={userRole}
          onPreview={(file) => setPreviewFile(file)}
          onDelete={handleDeleteFile}
          onUpload={() => setUploadOpen(true)}
        />

        {/* Chat Panel */}
        <ChatPanel roomId={roomId} isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
      </div>

      {/* Modals */}
      <MembersPanel
        isOpen={membersOpen}
        onClose={() => setMembersOpen(false)}
        roomId={roomId}
        userRole={userRole}
      />

      {selectedFolderId && (
        <FileUploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUpload={handleUpload}
          folderName={selectedFolder?.folderName || ''}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileId={previewFile._id}
          fileName={previewFile.fileName}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
}
