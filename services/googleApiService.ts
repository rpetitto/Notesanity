import { Classroom, DriveFile, FileType } from '../types';

const CLIENT_ID = '852539839153-osdv8qc0gqai1u0qhf9pq32nbdk2n0ci.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient: any;
let gapiInited = false;
let gsisInited = false;

const COURSE_COLORS = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#2563eb', // Blue
];

const getCourseColor = (courseId: string) => {
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COURSE_COLORS[hash % COURSE_COLORS.length];
};

export const initGoogleClient = async (onAuthChange: (authorized: boolean) => void): Promise<void> => {
  return new Promise((resolve) => {
    const checkInit = () => {
      if (gapiInited && gsisInited) resolve();
    };

    (window as any).gapi.load('client', async () => {
      try {
        await (window as any).gapi.client.init({
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            'https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest'
          ],
        });
        gapiInited = true;
        checkInit();
      } catch (e) {
        console.error("GAPI Init Failed", e);
      }
    });

    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error) {
          onAuthChange(false);
        } else {
          onAuthChange(true);
        }
      },
    });
    gsisInited = true;
    checkInit();
  });
};

export const requestAuthToken = () => {
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const listGoogleClassrooms = async (): Promise<Classroom[]> => {
  try {
    const response = await (window as any).gapi.client.classroom.courses.list();
    const courses = response.result.courses || [];
    
    // Filter for active classes only and apply deterministic themes
    return courses
      .filter((course: any) => course.courseState === 'ACTIVE')
      .map((course: any) => ({
        id: course.id,
        name: course.name,
        section: course.section || 'General',
        color: getCourseColor(course.id),
        driveFolderId: course.teacherFolder?.id || '',
        isSynced: false
      }));
  } catch (err) {
    console.error('Error listing classrooms:', err);
    return [];
  }
};

export const listDriveFiles = async (folderId: string): Promise<DriveFile[]> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime)',
      orderBy: 'folder,name'
    });
    
    const files = response.result.files || [];
    return files.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      parentId: folderId,
      lastModified: file.modifiedTime
    }));
  } catch (err) {
    console.error('Error listing drive files:', err);
    return [];
  }
};

export const getGoogleFileContent = async (fileId: string): Promise<string> => {
  try {
    const file = await (window as any).gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType'
    });

    if (file.result.mimeType === 'application/vnd.google-apps.document') {
      const exportResponse = await (window as any).gapi.client.drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain'
      });
      return exportResponse.body;
    }
    
    return `Content preview for ${file.result.mimeType} is not supported. View this file in Google Drive.`;
  } catch (err) {
    console.error('Error getting file content:', err);
    return 'Could not retrieve document content.';
  }
};