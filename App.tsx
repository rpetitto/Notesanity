import React, { useState, useEffect } from 'react';
import NavigationRail from './components/NavigationRail';
import FileDrawer from './components/FileDrawer';
import GeminiAssistant from './components/GeminiAssistant';
import TeacherDashboard from './components/TeacherDashboard';
import { Classroom, DriveFile } from './types';
import { getClasses, getFiles, getFileContent, createNewFolder } from './services/dataService';
import { 
  Sparkles, 
  ArrowLeft,
  Search,
  MoreVertical,
  Share2,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { generateSummary } from './services/geminiService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (currentFolderId) {
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId]);

  useEffect(() => {
    if (selectedFile) {
      setGeneratedSummary(null);
      setFileContent('Loading document content...');
      getFileContent(selectedFile.id).then(setFileContent);
    }
  }, [selectedFile]);

  const loadClasses = async () => {
    const data = await getClasses();
    setClasses(data);
    // If we're in student mode and nothing is selected, select the first available binder
    if (data.length > 0 && !selectedClassId && viewMode === 'student') {
      const first = data[0];
      setSelectedClassId(first.id);
      setCurrentFolderId(first.driveFolderId);
    }
  };

  const fetchFiles = async (folderId: string) => {
    setLoading(true);
    const data = await getFiles(folderId);
    setFiles(data);
    setLoading(false);
  };

  const handleSelectClass = (cls: Classroom) => {
    setSelectedClassId(cls.id);
    setCurrentFolderId(cls.driveFolderId);
    setSelectedFile(null);
    setFileContent('');
    setViewMode('student'); 
  };

  const handleCreateFolder = async () => {
    if (!currentFolderId) return;
    const name = prompt('New Section Name:');
    if (name) {
      const result = await createNewFolder(name, currentFolderId);
      if (result) fetchFiles(currentFolderId);
    }
  };

  const currentClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden">
      <NavigationRail 
        classes={classes} 
        selectedClassId={selectedClassId} 
        onSelectClass={(id) => {
            const cls = classes.find(c => c.id === id);
            if(cls) handleSelectClass(cls);
        }} 
        viewMode={viewMode}
        onToggleMode={setViewMode}
      />

      {viewMode === 'student' ? (
        <>
          {selectedClassId ? (
            <FileDrawer 
              files={files}
              onNavigate={setCurrentFolderId}
              onSelectFile={setSelectedFile}
              selectedFileId={selectedFile?.id || null}
              loading={loading}
              onCreateFolder={handleCreateFolder}
            />
          ) : (
             <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                    <LayoutGrid className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700">No Binders Yet</h3>
                <p className="text-sm text-slate-500 mt-2">Go to Teacher Dashboard to sync your first classroom.</p>
             </div>
          )}

          <main className="flex-1 flex flex-col min-w-0 bg-white relative m-2 mr-0 rounded-l-[32px] shadow-sm overflow-hidden border border-slate-200/50">
            
            {/* M3 Top App Bar */}
            <header className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-4 min-w-0">
                {currentFolderId !== currentClass?.driveFolderId && (
                   <button 
                     onClick={() => setCurrentFolderId(currentClass?.driveFolderId || null)}
                     className="p-2 hover:bg-slate-100 rounded-full m3-transition"
                    >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                )}
                <div className="truncate">
                   <h1 className="text-lg font-bold truncate">
                     {selectedFile ? selectedFile.name : (currentClass?.name || 'Academic Binder')}
                   </h1>
                   <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                     {currentClass?.section || 'Study Mode'}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full m3-transition">
                   <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full m3-transition">
                   <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full m3-transition">
                   <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#FCFCFF]">
              {selectedFile ? (
                <div className="max-w-4xl mx-auto">
                  <div className="m3-card p-8 md:p-12 mb-20 min-h-[80vh] border border-slate-100">
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h2 className="text-4xl font-serif text-slate-900 mb-2">{selectedFile.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>Last modified {new Date(selectedFile.lastModified).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={async () => {
                          setSummaryLoading(true);
                          const sum = await generateSummary(fileContent);
                          setGeneratedSummary(sum);
                          setSummaryLoading(false);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold hover:bg-indigo-100 m3-transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        {summaryLoading ? 'AI is thinking...' : 'Summary'}
                      </button>
                    </div>

                    {generatedSummary && (
                      <div className="mb-10 p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[28px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-600">
                            <Sparkles className="w-12 h-12" />
                        </div>
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                          Smart Summary
                        </h4>
                        <div className="text-indigo-800 text-sm leading-relaxed prose prose-indigo max-w-none">
                          {generatedSummary}
                        </div>
                      </div>
                    )}

                    <div className="prose prose-slate max-w-none">
                      <div className="font-serif text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {fileContent || <span className="text-slate-300 italic text-2xl">Start typing or upload a document to begin.</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6">
                    <LayoutGridIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-xl font-medium text-slate-500">Pick a page to start studying</p>
                  <p className="text-sm mt-2">All changes are synced in real-time with Google Drive.</p>
                </div>
              )}
            </div>

            {/* M3 Extended FAB */}
            <button 
              onClick={() => setAiSidebarOpen(true)}
              className={`
                fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-[28px] shadow-xl m3-transition z-50
                ${aiSidebarOpen ? 'scale-0 opacity-0' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl'}
              `}
            >
              <Sparkles className="w-6 h-6" />
              <span className="font-bold tracking-wide text-sm">ASK BINDER AI</span>
            </button>

            <GeminiAssistant 
              currentFile={selectedFile}
              fileContent={fileContent}
              isOpen={aiSidebarOpen}
              onClose={() => setAiSidebarOpen(false)}
            />
          </main>
        </>
      ) : (
        <main className="flex-1 bg-white m-2 mr-0 rounded-l-[32px] shadow-sm overflow-hidden border border-slate-200/50">
          <TeacherDashboard 
            syncedClasses={classes} 
            onSyncComplete={loadClasses} 
          />
        </main>
      )}
    </div>
  );
};

const LayoutGridIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);

export default App;