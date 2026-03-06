export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
}

export interface Room {
  _id: string;
  roomName: string;
  roomCode: string;
  adminUserId: string;
  role?: RoomRole;
  memberCount?: number;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type RoomRole = 'admin' | 'editor' | 'viewer';

export interface RoomMember {
  user: User;
  role: RoomRole;
  joinedAt: string;
}

export interface Folder {
  _id: string;
  roomId: string;
  folderName: string;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  folderId: string;
  roomId: string;
  uploadedBy: User | string;
  processed: boolean;
  uploadDate: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  userId: User | string;
  message: string;
  response: string;
  fileReferences: FileReference[];
  createdAt: string;
}

export interface FileReference {
  fileId: string;
  fileName: string;
  fileUrl: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
