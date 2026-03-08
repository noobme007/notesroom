'use client';

import React, { useState } from 'react';
import { FiFolder, FiFolderPlus, FiTrash2, FiChevronRight } from 'react-icons/fi';
import { Folder, RoomRole } from '@/types';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  userRole: RoomRole;
  roomName: string;
}

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  userRole,
  roomName,
}: FolderSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const canCreate = userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setLoading(true);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-72 bg-dark-900/90 md:bg-dark-900/80 backdrop-blur-xl border-r border-dark-700 flex flex-col h-full shadow-2xl md:shadow-none">
      {/* Room Header */}
      <div className="p-5 border-b border-dark-700/50">
        <h2 className="text-xl font-bold text-white truncate tracking-tight">{roomName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          <p className="text-dark-400 text-xs font-semibold uppercase tracking-widest">{userRole}</p>
        </div>
      </div>

      {/* Folders Header */}
      <div className="p-3 flex items-center justify-between">
        <span className="text-dark-400 text-sm font-medium uppercase tracking-wider">
          Folders
        </span>
        {canCreate && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="text-dark-400 hover:text-primary-400 transition-colors p-1"
            title="Create folder"
          >
            <FiFolderPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Folder Input */}
      {isCreating && (
        <form onSubmit={handleCreate} className="px-3 pb-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="input-field text-sm py-1.5"
            autoFocus
            disabled={loading}
          />
        </form>
      )}

      {/* Folder List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {folders.length === 0 ? (
          <p className="text-dark-500 text-sm px-4 py-6 text-center">
            No folders yet.{canCreate && ' Create one!'}
          </p>
        ) : (
          folders.map((folder) => (
            <div
              key={folder._id}
              className={`group flex items-center gap-2 px-3 py-2 mx-2 my-0.5 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder._id
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'text-dark-300 hover:bg-dark-800 hover:text-white border border-transparent'
                }`}
              onClick={() => onSelectFolder(folder._id)}
            >
              <FiFolder
                className={`w-4 h-4 flex-shrink-0 ${selectedFolderId === folder._id ? 'text-primary-400' : 'text-dark-400'
                  }`}
              />
              <span className="flex-1 text-sm truncate">{folder.folderName}</span>
              {selectedFolderId === folder._id && (
                <FiChevronRight className="w-3 h-3 text-primary-400 flex-shrink-0" />
              )}
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-dark-500 hover:text-red-400 p-0.5 transition-all"
                  title="Delete folder"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
