import React from 'react';
import { DriveFile, FileType } from '../types';
import { Folder, FileText, ChevronRight, FolderOpen, Plus, Search } from 'lucide-react';

interface FileDrawerProps {
  files: DriveFile[];
  onNavigate: (folderId: string) => void;
  onSelectFile: (file: DriveFile) => void;
  selectedFileId: string | null;
  loading: boolean;
  onCreateFolder: () => void;
}

const FileDrawer: React.FC<FileDrawerProps> = ({ 
  files, 
  onNavigate, 
  onSelectFile, 
  selectedFileId, 
  loading,
  onCreateFolder
}) => {
  const folders = files.filter(f => f.mimeType === FileType.FOLDER);
  const docs = files.filter(f => f.mimeType !== FileType.FOLDER);

  return (
    <div className="w-80 bg-slate-50 h-full flex flex-col shrink-0 border-r border-slate-200">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Workspace</h2>
            <button onClick={onCreateFolder} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-full m3-transition">
                <Plus className="w-5 h-5" />
            </button>
        </div>
        <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Find in sections..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
        {loading ? (
           <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-10 bg-slate-200 rounded-xl"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
           </div>
        ) : (
          <>
            <div className="mb-6">
               <h3 className="px-3 py-2 text-xs font-bold text-slate-400">FOLDERS</h3>
               {folders.map(folder => (
                 <button 
                    key={folder.id}
                    onClick={() => onNavigate(folder.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-2xl hover:bg-slate-200 m3-transition text-left group"
                 >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-200 m3-transition">
                        <Folder className="w-4 h-4" />
                    </div>
                    <span className="truncate flex-1 font-medium">{folder.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                 </button>
               ))}
            </div>

            <div>
               <h3 className="px-3 py-2 text-xs font-bold text-slate-400">PAGES</h3>
               <div className="space-y-1">
               {docs.map(file => (
                 <button 
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className={`
                        w-full flex flex-col gap-0.5 px-4 py-4 rounded-[24px] m3-transition text-left
                        ${selectedFileId === file.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'hover:bg-slate-200 text-slate-600'}
                    `}
                 >
                    <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${selectedFileId === file.id ? 'text-indigo-100' : 'text-indigo-500'}`} />
                        <span className="truncate font-semibold">{file.name}</span>
                    </div>
                    <span className={`text-[10px] pl-6 ${selectedFileId === file.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Edited {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                 </button>
               ))}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDrawer;