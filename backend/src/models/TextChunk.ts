import mongoose, { Document, Schema } from 'mongoose';

export interface ITextChunk extends Document {
  fileId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  content: string;
  chunkIndex: number;
  fileName: string;
  createdAt: Date;
}

const textChunkSchema = new Schema<ITextChunk>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

textChunkSchema.index({ roomId: 1, content: 'text' });

export const TextChunk = mongoose.model<ITextChunk>('TextChunk', textChunkSchema);
