import React, { useState, useEffect } from 'react';
import NavigationRail from './components/NavigationRail';
import FileDrawer from './components/FileDrawer';
import GeminiAssistant from './components/GeminiAssistant';
import TeacherDashboard from './components/TeacherDashboard';
import { Classroom, DriveFile } from './types';
import { getClasses } from './services/dataService';
import { 
  initGoogleClient, 
  requestAuthToken, 
  listDriveFiles, 
  getGoogleFileContent 
} from './services/googleApiService';
import { 
  Sparkles, 
  ArrowLeft,
  Search,
  MoreVertical,
  Share2,
  Clock,
  LayoutGrid,
  GraduationCap,
  LogIn,
  Loader2
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await initGoogleClient((authorized) => {
        setIsAuthorized(authorized);
        if (authorized) {
          loadClasses();
        }
      });
      setInitializing(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isAuthorized && currentFolderId) {
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId, isAuthorized]);

  useEffect(() => {
    if (selectedFile && isAuthorized) {
      setGeneratedSummary(null);
      setFileContent('Fetching document content...');
      getGoogleFileContent(selectedFile.id).then(setFileContent);
    }
  }, [selectedFile, isAuthorized]);

  const loadClasses = async () => {
    const data = await getClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClassId && viewMode === 'student') {
      const first = data[0];
      setSelectedClassId(first.id);
      setCurrentFolderId(first.driveFolderId);
    }
  };

  const fetchFiles = async (folderId: string) => {
    setLoading(true);
    const data = await listDriveFiles(folderId);
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

  const handleSignIn = () => {
    requestAuthToken();
  };

  if (initializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-100 animate-bounce">
            <GraduationCap className="text-white w-8 h-8" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col justify-center px-10 md:px-24">
            <div className="mb-8 w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white">
                <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">Your academic life,<br/><span className="text-indigo-600">Perfectly Organized.</span></h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed">NoteSanity turns your Google Classroom courses and Drive files into a beautiful, digital binder powered by AI.</p>
            
            <button 
              onClick={handleSignIn}
              className="flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-[24px] font-bold text-lg hover:bg-slate-800 m3-transition shadow-xl active:scale-95 w-fit"
            >
              <LogIn className="w-6 h-6" />
              Sign in with Google
            </button>

            <div className="mt-20 flex gap-12">
                <div>
                    <div className="text-2xl font-bold text-slate-800">100%</div>
                    <div className="text-slate-400 text-sm">Drive Synced</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">AI</div>
                    <div className="text-slate-400 text-sm">Study Assistant</div>
                </div>
            </div>
        </div>
        <div className="flex-1 bg-slate-50 hidden md:flex items-center justify-center">
            <div className="w-[80%] aspect-video m3-card bg-white p-8 border border-slate-100 relative overflow-hidden flex flex-col">
                <div className="h-4 w-32 bg-slate-100 rounded-full mb-8"></div>
                <div className="flex gap-4">
                    <div className="w-1/3 space-y-3">
                        <div className="h-8 bg-indigo-50 rounded-xl"></div>
                        <div className="h-8 bg-slate-50 rounded-xl"></div>
                        <div className="h-8 bg-slate-50 rounded-xl"></div>
                    </div>
                    <div className="flex-1 p-6 bg-slate-50 rounded-3xl">
                        <div className="h-4 w-full bg-slate-200 rounded mb-4"></div>
                        <div className="h-4 w-[90%] bg-slate-200 rounded mb-4"></div>
                        <div className="h-4 w-[85%] bg-slate-200 rounded mb-8"></div>
                        <div className="h-32 w-full bg-indigo-100/50 rounded-2xl border border-dashed border-indigo-200"></div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] opacity-10"></div>
            </div>
        </div>
      </div>
    );
  }

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
              onCreateFolder={() => {}} // Disabled for now to prevent Drive mutations in metadata
            />
          ) : (
             <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                    <LayoutGrid className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700">No Binders Yet</h3>
                <p className="text-sm text-slate-500 mt-2">Go to Teacher Mode to sync courses from Google Classroom.</p>
             </div>
          )}

          <main className="flex-1 flex flex-col min-w-0 bg-white relative m-2 mr-0 rounded-l-[32px] shadow-sm overflow-hidden border border-slate-200/50">
            
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
                   <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

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
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">Smart Summary</h4>
                        <div className="text-indigo-800 text-sm leading-relaxed prose prose-indigo max-w-none whitespace-pre-wrap">{generatedSummary}</div>
                      </div>
                    )}

                    <div className="prose prose-slate max-w-none">
                      <div className="font-serif text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {fileContent}
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

            <button 
              onClick={() => setAiSidebarOpen(true)}
              className={`
                fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-[28px] shadow-xl m3-transition z-50
                ${aiSidebarOpen ? 'scale-0 opacity-0' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-2xl'}
              `}
            >
              <Sparkles className="w-6 h-6" />
              <span className="font-bold tracking-wide text-sm uppercase">Ask Binder AI</span>
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