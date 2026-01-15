import { supabase } from '../lib/supabase';
import { Classroom, DriveFile, FileType } from '../types';

export const getClasses = async (): Promise<Classroom[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) {
      console.warn('Supabase Error:', error.message);
      return [];
    }
    return data as Classroom[];
  } catch (err: any) {
    console.error('Database connection failed (Check Supabase URL/Status):', err.message);
    return [];
  }
};

export const syncGoogleClassroom = async (classroom: Classroom): Promise<boolean> => {
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
      console.error('Error syncing classroom:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Sync failed due to network error:', err.message);
    // Return false to let UI know sync didn't persist to the DB
    return false;
  }
};

export const getFiles = async (parentId: string): Promise<DriveFile[]> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('parentId', parentId)
      .order('mimeType', { ascending: false })
      .order('name');

    if (error) {
      console.warn('Error fetching files from Supabase:', error.message);
      return [];
    }
    return data as DriveFile[];
  } catch (err: any) {
    console.error('Supabase fetch failed:', err.message);
    return [];
  }
};

export const getFileContent = async (fileId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('content')
      .eq('id', fileId)
      .single();

    if (error) {
      console.warn('Error fetching content from Supabase:', error.message);
      return '';
    }
    return data?.content || 'No content found.';
  } catch (err: any) {
    return '';
  }
};

export const createNewFolder = async (name: string, parentId: string): Promise<DriveFile | null> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .insert([{
        name,
        parentId,
        mimeType: FileType.FOLDER,
        lastModified: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    return null;
  }
};