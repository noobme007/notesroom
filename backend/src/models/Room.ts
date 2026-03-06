import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomName: string;
  roomCode: string;
  adminUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 6,
      index: true,
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model<IRoom>('Room', roomSchema);
