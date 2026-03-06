import mongoose, { Document, Schema } from 'mongoose';

export interface IFolder extends Document {
  roomId: mongoose.Types.ObjectId;
  folderName: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    folderName: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

folderSchema.index({ roomId: 1, folderName: 1 }, { unique: true });

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
