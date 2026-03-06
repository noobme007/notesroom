import mongoose, { Document, Schema } from 'mongoose';

export type RoomRole = 'admin' | 'editor' | 'viewer';

export interface IRoomMember extends Document {
  userId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  role: RoomRole;
  joinedAt: Date;
}

const roomMemberSchema = new Schema<IRoomMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

roomMemberSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export const RoomMember = mongoose.model<IRoomMember>('RoomMember', roomMemberSchema);
