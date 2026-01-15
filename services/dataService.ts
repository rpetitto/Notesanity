import { supabase } from '../lib/supabase';
import { Classroom, DriveFile, FileType } from '../types';

const LOCAL_STORAGE_KEY = 'notesanity_classes_v1';

export const getClasses = async (): Promise<Classroom[]> => {
  // 1. Optimistic Local Load
  let localClasses: Classroom[] = [];
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      localClasses = JSON.parse(local);
    }
  } catch (e) {
    console.error('Error parsing local classes', e);
  }

  // 2. Try Supabase Sync
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (!error && data) {
      // Update local cache on successful cloud fetch
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data as Classroom[];
    }
  } catch (err: any) {
    console.warn('Database connection failed, using local cache:', err.message);
  }

  // Fallback to local data if cloud fails
  return localClasses;
};

export const syncGoogleClassroom = async (classroom: Classroom): Promise<boolean> => {
  // 1. Save locally first (Optimistic UI)
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    let classes: Classroom[] = local ? JSON.parse(local) : [];
    
    const existingIndex = classes.findIndex(c => c.id === classroom.id);
    if (existingIndex >= 0) {
      classes[existingIndex] = classroom;
    } else {
      classes.push(classroom);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(classes));
  } catch (e) {
    console.error('Local save failed', e);
    return false;
  }

  // 2. Try Supabase Sync (Background)
  try {
    const { error } = await supabase
      .from('classes')
      .upsert([{
        id: classroom.id,
        name: classroom.name,
        section: classroom.section,
        color: classroom.color,
        driveFolderId: classroom.driveFolderId
      }]);

    if (error) {
      console.warn('Cloud sync failed (saved locally):', error.message);
      // Return true because local save succeeded, allowing user to proceed
      return true;
    }
    return true;
  } catch (err: any) {
    console.warn('Network error during sync (saved locally):', err.message);
    return true;
  }
};

// Deprecated or Unused for Drive files (App uses direct Google API)
// Kept for compatibility if needed later
export const getFiles = async (parentId: string): Promise<DriveFile[]> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('parentId', parentId);
    return (data as DriveFile[]) || [];
  } catch (e) { return []; }
};

export const getFileContent = async (fileId: string): Promise<string> => {
   // Stubbed as we use Google API for content now
   return '';
};

export const createNewFolder = async (name: string, parentId: string): Promise<DriveFile | null> => {
  return null;
};