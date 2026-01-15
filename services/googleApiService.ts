import { Classroom, DriveFile, FileType } from '../types';

const CLIENT_ID = '852539839153-osdv8qc0gqai1u0qhf9pq32nbdk2n0ci.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient: any;
let gapiInited = false;
let gsisInited = false;

export const initGoogleClient = async (onAuthChange: (authorized: boolean) => void): Promise<void> => {
  return new Promise((resolve) => {
    const checkInit = () => {
      if (gapiInited && gsisInited) resolve();
    };

    // Initialize GAPI
    // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
    (window as any).gapi.load('client', async () => {
      // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
      await (window as any).gapi.client.init({
        apiKey: '', // Optional for these scopes if using OAuth
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest'
        ],
      });
      gapiInited = true;
      checkInit();
    });

    // Initialize GIS (Google Identity Services)
    // Fix: Use type assertion (window as any).google to resolve TS 'property does not exist' error.
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
    // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
    const response = await (window as any).gapi.client.classroom.courses.list();
    const courses = response.result.courses || [];
    
    return courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      section: course.section || 'General',
      color: '#4f46e5', // Default color, ideally derived from course.courseColor
      driveFolderId: course.teacherFolder?.id || '', // Note: student might need different folder logic
      isSynced: false
    }));
  } catch (err) {
    console.error('Error listing classrooms:', err);
    return [];
  }
};

export const listDriveFiles = async (folderId: string): Promise<DriveFile[]> => {
  try {
    // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
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
    // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
    // For Google Docs, we export as text or fetch metadata if non-text
    const file = await (window as any).gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType'
    });

    if (file.result.mimeType === 'application/vnd.google-apps.document') {
      // Fix: Use type assertion (window as any).gapi to resolve TS 'property does not exist' error.
      const exportResponse = await (window as any).gapi.client.drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain'
      });
      return exportResponse.body;
    }
    
    return `Content preview for ${file.result.mimeType} is not supported yet in the binder view.`;
  } catch (err) {
    console.error('Error getting file content:', err);
    return 'Could not retrieve document content.';
  }
};