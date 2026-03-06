'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiShield, FiEdit3, FiEye, FiTrash2, FiLoader } from 'react-icons/fi';
import { roomService } from '@/services/roomService';
import { RoomMember, RoomRole } from '@/types';

interface MembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  userRole: RoomRole;
}

export function MembersPanel({ isOpen, onClose, roomId, userRole }: MembersPanelProps) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await roomService.listMembers(roomId);
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: RoomRole) => {
    try {
      await roomService.updateMemberRole(roomId, userId, role);
      await loadMembers();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member from the room?')) return;
    try {
      await roomService.removeMember(roomId, userId);
      await loadMembers();
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const getRoleIcon = (role: RoomRole) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-3.5 h-3.5 text-yellow-400" />;
      case 'editor':
        return <FiEdit3 className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <FiEye className="w-3.5 h-3.5 text-dark-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card max-w-md w-full mx-4 max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiUsers className="text-primary-400" />
            Members
          </h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.user._id}
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg"
              >
                {member.user.profilePicture ? (
                  <img
                    src={member.user.profilePicture}
                    alt={member.user.name}
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-medium text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{member.user.name}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {getRoleIcon(member.role)}
                    <span className="text-dark-400 capitalize">{member.role}</span>
                  </div>
                </div>

                {userRole === 'admin' && member.role !== 'admin' && (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRole(member.user._id, e.target.value as RoomRole)
                      }
                      className="bg-dark-700 border border-dark-600 rounded text-xs text-white px-1.5 py-1"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => removeMember(member.user._id)}
                      className="text-dark-400 hover:text-red-400 p-1"
                      title="Remove member"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
