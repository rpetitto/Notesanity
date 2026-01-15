export enum FileType {
  FOLDER = 'application/vnd.google-apps.folder',
  DOC = 'application/vnd.google-apps.document',
  SHEET = 'application/vnd.google-apps.spreadsheet',
  SLIDE = 'application/vnd.google-apps.presentation',
  PDF = 'application/pdf',
  IMAGE = 'image/jpeg',
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: FileType | string;
  parentId: string | null;
  content?: string; // Mock content for preview
  lastModified: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface Classroom {
  id: string;
  name: string;
  section?: string;
  color: string;
  driveFolderId: string; // The root folder ID for this class
  isSynced?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}