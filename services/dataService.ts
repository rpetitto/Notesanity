import { supabase } from '../lib/supabase';
import { Classroom, DriveFile, FileType } from '../types';

export const getClasses = async (): Promise<Classroom[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching classes:', error.message || JSON.stringify(error));
    return [];
  }
  return data as Classroom[];
};

// Mock function to simulate fetching "Available" Google Classrooms from Teacher's account
export const getAvailableGoogleClassrooms = async (): Promise<Classroom[]> => {
  // In a real app, this would query Google Classroom API
  return [
    { id: 'gc_101', name: 'Intro to Economics', section: 'Spring 2024', color: '#10b981', driveFolderId: 'folder_econ_root', isSynced: false },
    { id: 'gc_102', name: 'Advanced Chemistry', section: 'Period 3', color: '#f43f5e', driveFolderId: 'folder_chem_root', isSynced: false },
    { id: 'gc_103', name: 'Creative Writing', section: 'Afternoon', color: '#8b5cf6', driveFolderId: 'folder_write_root', isSynced: false },
    { id: 'gc_104', name: 'World History', section: 'Period 1', color: '#f59e0b', driveFolderId: 'folder_history_new', isSynced: false },
  ];
};

export const syncGoogleClassroom = async (classroom: Classroom): Promise<boolean> => {
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
    console.error('Error syncing classroom:', error.message || JSON.stringify(error));
    return false;
  }
  return true;
};

export const getFiles = async (parentId: string): Promise<DriveFile[]> => {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('parentId', parentId)
    .order('mimeType', { ascending: false }) // Folders first
    .order('name');

  if (error) {
    console.error('Error fetching files:', error.message || JSON.stringify(error));
    return [];
  }
  return data as DriveFile[];
};

export const getFileContent = async (fileId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('files')
    .select('content')
    .eq('id', fileId)
    .single();

  if (error) {
    console.error('Error fetching file content:', error.message || JSON.stringify(error));
    return '';
  }
  return data?.content || 'No content found.';
};

export const createNewFolder = async (name: string, parentId: string): Promise<DriveFile | null> => {
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
    console.error('Error creating folder:', error.message || JSON.stringify(error));
    return null;
  }
  return data;
};