import React, { useState } from 'react';
import { DriveFile, FileType } from '../types';
import { Folder, FileText, ChevronRight, FolderOpen, MoreVertical, Plus } from 'lucide-react';

interface SectionListProps {
  files: DriveFile[];
  currentFolderId: string;
  onNavigate: (folderId: string) => void;
  onSelectFile: (file: DriveFile) => void;
  selectedFileId: string | null;
  classNameName?: string;
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateFolder: () => void;
}

const SectionList: React.FC<SectionListProps> = ({ 
  files, 
  currentFolderId, 
  onNavigate, 
  onSelectFile, 
  selectedFileId, 
  loading,
  onUpload,
  onCreateFolder
}) => {
  const folders = files.filter(f => f.mimeType === FileType.FOLDER);
  const docs = files.filter(f => f.mimeType !== FileType.FOLDER);

  return (
    <div className="w-72 bg-slate-50 h-full border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h2 className="font-semibold text-slate-700">Sections</h2>
        <div className="flex gap-1">
             <button onClick={onCreateFolder} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="New Folder">
                <FolderOpen className="w-4 h-4" />
             </button>
             <label className="p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer" title="Upload File">
                <Plus className="w-4 h-4" />
                <input type="file" className="hidden" onChange={onUpload} />
             </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
           <div className="p-4 text-sm text-slate-400 text-center">Syncing with Drive...</div>
        ) : (
          <>
            {/* Breadcrumb / Up Navigation if not at root would go here, 
                but for OneNote style, we usually stay flat or use tabs. 
                Simulating flat list of current folder contents. */}
            
            {/* Sections (Folders) */}
            <div className="mb-4">
               <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Folders</div>
               {folders.length === 0 && <div className="px-2 text-xs text-slate-400 italic">No sub-folders</div>}
               {folders.map(folder => (
                 <div 
                    key={folder.id}
                    onClick={() => onNavigate(folder.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer group"
                 >
                    <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="truncate flex-1">{folder.name}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                 </div>
               ))}
            </div>

            {/* Pages (Files) */}
            <div>
               <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Pages</div>
               {docs.length === 0 && <div className="px-2 text-xs text-slate-400 italic">No files</div>}
               {docs.map(file => (
                 <div 
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className={`
                        flex items-center gap-2 px-3 py-3 text-sm rounded-md cursor-pointer border-l-4 transition-all
                        ${selectedFileId === file.id 
                            ? 'bg-white border-indigo-500 shadow-sm' 
                            : 'border-transparent hover:bg-slate-100 text-slate-600'}
                    `}
                 >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="text-[10px] text-slate-400 truncate">
                            {new Date(file.lastModified).toLocaleDateString()}
                        </span>
                    </div>
                 </div>
               ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SectionList;