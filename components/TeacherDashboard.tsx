import React, { useState, useEffect } from 'react';
import { Classroom } from '../types';
import { syncGoogleClassroom } from '../services/dataService';
import { listGoogleClassrooms } from '../services/googleApiService';
// Fix: Corrected import from 'lucide-center' to 'lucide-react' and added GraduationCap to the shared import.
import { RefreshCcw, CheckCircle2, Plus, ArrowRight, Loader2, AlertCircle, GraduationCap } from 'lucide-react';

interface TeacherDashboardProps {
  syncedClasses: Classroom[];
  onSyncComplete: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ syncedClasses, onSyncComplete }) => {
  const [availableClasses, setAvailableClasses] = useState<Classroom[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailable();
  }, [syncedClasses]);

  const loadAvailable = async () => {
    try {
      setLoading(true);
      setError(null);
      const available = await listGoogleClassrooms();
      const syncedIds = syncedClasses.map(c => c.id);
      setAvailableClasses(available.filter(ac => !syncedIds.includes(ac.id)));
    } catch (err) {
      setError("Failed to load Google Classrooms. Ensure you've given permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (cls: Classroom) => {
    setSyncingId(cls.id);
    setError(null);
    const success = await syncGoogleClassroom(cls);
    if (success) {
      onSyncComplete();
    } else {
      setError("Failed to sync binder to database.");
    }
    setSyncingId(null);
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto h-full overflow-y-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Teacher Mode</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Google Classroom Sync</h1>
        <p className="text-slate-500 text-lg">Convert your courses into digital binders with one click.</p>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        <div 
          onClick={loadAvailable}
          className="m3-card p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center mb-4 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 m3-transition">
            <RefreshCcw className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="font-bold text-lg text-slate-700">Refresh Courses</h3>
          <p className="text-sm text-slate-400 mt-2">Scan Classroom for updates</p>
        </div>

        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          availableClasses.map(cls => (
            <div key={cls.id} className="m3-card p-6 flex flex-col m3-transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-indigo-600"
                >
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Available</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
              <p className="text-sm text-slate-500 mb-8">{cls.section}</p>
              
              <button 
                onClick={() => handleSync(cls)}
                disabled={!!syncingId}
                className="mt-auto flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 m3-transition"
              >
                {syncingId === cls.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Binder</>}
              </button>
            </div>
          ))
        )}

        {syncedClasses.map(cls => (
          <div key={cls.id} className="m3-card p-6 flex flex-col bg-slate-50/50 border border-slate-200 opacity-80">
            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 bg-slate-100">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Binder
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
              <p className="text-sm text-slate-500 mb-8">{cls.section}</p>
              
              <button className="mt-auto flex items-center justify-between w-full p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-medium hover:bg-slate-100 m3-transition group cursor-default">
                Binder Active
                <ArrowRight className="w-4 h-4" />
              </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default TeacherDashboard;