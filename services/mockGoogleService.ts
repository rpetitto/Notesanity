import { Classroom, DriveFile, FileType } from '../types';

// --- Mock Data ---

const MOCK_CLASSES: Classroom[] = [
  { id: 'class_1', name: 'AP History', section: 'Period 2', color: '#ea580c', driveFolderId: 'folder_history_root' },
  { id: 'class_2', name: 'Calculus BC', section: 'Period 4', color: '#16a34a', driveFolderId: 'folder_math_root' },
  { id: 'class_3', name: 'English Lit', section: 'Period 1', color: '#2563eb', driveFolderId: 'folder_english_root' },
  { id: 'class_4', name: 'Physics I', section: 'Period 6', color: '#9333ea', driveFolderId: 'folder_physics_root' },
];

const INITIAL_FILES: DriveFile[] = [
  // History
  { id: 'folder_history_root', name: 'AP History', mimeType: FileType.FOLDER, parentId: null, lastModified: '2023-10-01' },
  { id: 'folder_h_unit1', name: 'Unit 1: Colonization', mimeType: FileType.FOLDER, parentId: 'folder_history_root', lastModified: '2023-10-02' },
  { id: 'folder_h_unit2', name: 'Unit 2: Revolution', mimeType: FileType.FOLDER, parentId: 'folder_history_root', lastModified: '2023-10-15' },
  { id: 'doc_h_1', name: 'Treaty Analysis', mimeType: FileType.DOC, parentId: 'folder_h_unit1', content: 'Analysis of the Treaty of Paris...\n1. Terms\n2. Impact', lastModified: '2023-10-05' },
  { id: 'pdf_h_1', name: 'Map of Colonies.pdf', mimeType: FileType.PDF, parentId: 'folder_h_unit1', lastModified: '2023-10-03' },
  
  // Math
  { id: 'folder_math_root', name: 'Calculus BC', mimeType: FileType.FOLDER, parentId: null, lastModified: '2023-09-01' },
  { id: 'folder_m_limits', name: 'Limits & Continuity', mimeType: FileType.FOLDER, parentId: 'folder_math_root', lastModified: '2023-09-10' },
  { id: 'sheet_m_1', name: 'Homework Tracker', mimeType: FileType.SHEET, parentId: 'folder_math_root', lastModified: '2023-09-05' },
  { id: 'doc_m_1', name: 'Derivatives Notes', mimeType: FileType.DOC, parentId: 'folder_m_limits', content: 'Definition of a derivative:\nThe slope of the tangent line...', lastModified: '2023-09-12' },

  // English
  { id: 'folder_english_root', name: 'English Lit', mimeType: FileType.FOLDER, parentId: null, lastModified: '2023-09-01' },
  { id: 'folder_e_gatsby', name: 'The Great Gatsby', mimeType: FileType.FOLDER, parentId: 'folder_english_root', lastModified: '2023-11-01' },
  { id: 'doc_e_1', name: 'Essay Draft', mimeType: FileType.DOC, parentId: 'folder_e_gatsby', content: 'The green light represents...', lastModified: '2023-11-10' },

  // Physics
  { id: 'folder_physics_root', name: 'Physics I', mimeType: FileType.FOLDER, parentId: null, lastModified: '2023-09-01' },
];

// --- Simulation Logic ---

let fileSystem = [...INITIAL_FILES];

export const getClasses = async (): Promise<Classroom[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLASSES), 300));
};

export const getFiles = async (parentId: string): Promise<DriveFile[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const files = fileSystem.filter(f => f.parentId === parentId);
      resolve(files);
    }, 200);
  });
};

export const getFileContent = async (fileId: string): Promise<string> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      const file = fileSystem.find(f => f.id === fileId);
      resolve(file?.content || "No content preview available for this file type.");
    }, 400);
  });
}

// Simulates moving a file in Drive, which updates the "Binder" structure
export const moveFile = async (fileId: string, newParentId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fileSystem = fileSystem.map(f => 
        f.id === fileId ? { ...f, parentId: newParentId } : f
      );
      resolve(true);
    }, 300);
  });
};

export const createFolder = async (name: string, parentId: string): Promise<DriveFile> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newFolder: DriveFile = {
                id: `folder_${Date.now()}`,
                name,
                mimeType: FileType.FOLDER,
                parentId,
                lastModified: new Date().toISOString()
            };
            fileSystem.push(newFolder);
            resolve(newFolder);
        }, 300);
    });
};
