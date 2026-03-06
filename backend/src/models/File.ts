import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  folderId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  processed: boolean;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const File = mongoose.model<IFile>('File', fileSchema);
