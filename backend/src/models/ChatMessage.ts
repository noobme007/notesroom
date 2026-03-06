import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  response: string;
  fileReferences: Array<{
    fileId: mongoose.Types.ObjectId;
    fileName: string;
    fileUrl: string;
  }>;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    fileReferences: [
      {
        fileId: { type: Schema.Types.ObjectId, ref: 'File' },
        fileName: String,
        fileUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
