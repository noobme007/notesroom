import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { RoomMember, RoomRole } from '../models';

/**
 * Middleware to check if the user is a member of the room
 * and optionally enforce a minimum role.
 */
export const requireRoomRole = (...allowedRoles: RoomRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roomId = req.params.roomId || req.params.id;
      const userId = req.user?._id;

      if (!roomId || !userId) {
        res.status(400).json({ error: 'Room ID and authentication required' });
        return;
      }

      const membership = await RoomMember.findOne({ userId, roomId });

      if (!membership) {
        res.status(403).json({ error: 'You are not a member of this room' });
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        res.status(403).json({
          error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`,
        });
        return;
      }

      // Attach membership info to request
      (req as any).membership = membership;
      next();
    } catch (error) {
      console.error('Room access error:', error);
      res.status(500).json({ error: 'Error checking room permissions' });
    }
  };
};

/**
 * Middleware to check room membership (any role).
 */
export const requireRoomMember = requireRoomRole();
