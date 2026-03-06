import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Room, RoomMember, User } from '../models';
import { generateUniqueRoomCode } from '../utils/roomCode';

/**
 * POST /api/rooms
 * Create a new room.
 */
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomName } = req.body;
    const userId = req.user!._id;

    if (!roomName || roomName.trim().length === 0) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }

    // Generate unique room code
    const roomCode = await generateUniqueRoomCode(async (code) => {
      const existing = await Room.findOne({ roomCode: code });
      return !!existing;
    });

    // Create room
    const room = await Room.create({
      roomName: roomName.trim(),
      roomCode,
      adminUserId: userId,
    });

    // Add creator as admin member
    await RoomMember.create({
      userId,
      roomId: room._id,
      role: 'admin',
    });

    res.status(201).json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

/**
 * POST /api/rooms/join
 * Join a room by code.
 */
export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.body;
    const userId = req.user!._id;

    if (!roomCode) {
      res.status(400).json({ error: 'Room code is required' });
      return;
    }

    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      res.status(404).json({ error: 'Room not found. Check the room code.' });
      return;
    }

    // Check if already a member
    const existingMembership = await RoomMember.findOne({
      userId,
      roomId: room._id,
    });

    if (existingMembership) {
      res.json({ room, message: 'Already a member of this room' });
      return;
    }

    // Add as viewer
    await RoomMember.create({
      userId,
      roomId: room._id,
      role: 'viewer',
    });

    res.json({ room, message: 'Successfully joined room' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

/**
 * GET /api/rooms
 * List all rooms the user is a member of.
 */
export const listRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    const memberships = await RoomMember.find({ userId }).populate('roomId');

    const rooms = memberships.map((m) => ({
      ...(m.roomId as any).toObject(),
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json({ rooms });
  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
};

/**
 * GET /api/rooms/:id
 * Get room details.
 */
export const getRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const membership = await RoomMember.findOne({ userId, roomId: id });
    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this room' });
      return;
    }

    const memberCount = await RoomMember.countDocuments({ roomId: id });

    res.json({
      room: {
        ...room.toObject(),
        role: membership.role,
        memberCount,
      },
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
};

/**
 * GET /api/rooms/:id/members
 * List room members.
 */
export const listMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const members = await RoomMember.find({ roomId: id }).populate(
      'userId',
      'name email profilePicture'
    );

    res.json({
      members: members.map((m) => ({
        user: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
};

/**
 * PUT /api/rooms/:id/members/:userId
 * Update member role (admin only).
 */
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const membership = await RoomMember.findOne({ userId, roomId: id });
    if (!membership) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    membership.role = role;
    await membership.save();

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * DELETE /api/rooms/:id/members/:userId
 * Remove a member from the room (admin only).
 */
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user!._id.toString();

    // Prevent admin from removing themselves
    if (userId === currentUserId) {
      res.status(400).json({ error: 'Cannot remove yourself from the room' });
      return;
    }

    const result = await RoomMember.findOneAndDelete({ userId, roomId: id });

    if (!result) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
