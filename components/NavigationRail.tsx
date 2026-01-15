import React from 'react';
import { Classroom } from '../types';
import { GraduationCap, LayoutGrid, Settings, Plus, UserCircle, Briefcase } from 'lucide-react';

interface NavigationRailProps {
  classes: Classroom[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  viewMode: 'student' | 'teacher';
  onToggleMode: (mode: 'student' | 'teacher') => void;
}

const NavigationRail: React.FC<NavigationRailProps> = ({ 
  classes, 
  selectedClassId, 
  onSelectClass, 
  viewMode, 
  onToggleMode 
}) => {
  return (
    <nav className="w-20 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 h-full shrink-0">
      <div className="mb-6 p-2 text-indigo-600">
        <GraduationCap className="w-7 h-7" />
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full items-center overflow-y-auto pt-2">
        {viewMode === 'student' && classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            className="flex flex-col items-center gap-1 group w-full"
          >
            <div 
              className={`
                w-14 h-8 rounded-full flex items-center justify-center m3-transition
                ${selectedClassId === cls.id ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-200 text-slate-500'}
              `}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: cls.color }}
              />
            </div>
            <span className={`text-[10px] font-medium truncate w-16 text-center ${selectedClassId === cls.id ? 'text-slate-900' : 'text-slate-500'}`}>
              {cls.name}
            </span>
          </button>
        ))}

        {viewMode === 'student' && (
          <button 
            onClick={() => onToggleMode('teacher')}
            className="flex flex-col items-center gap-1 group w-full mt-2"
          >
            <div className="w-14 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 m3-transition">
                <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-500">Join</span>
          </button>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-6 items-center pb-4">
         <button 
            onClick={() => onToggleMode(viewMode === 'student' ? 'teacher' : 'student')}
            className={`p-2 rounded-full m3-transition ${viewMode === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
            title={viewMode === 'student' ? 'Teacher Dashboard' : 'Student Binder'}
          >
            {viewMode === 'student' ? <Briefcase className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
         </button>
         <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full m3-transition">
            <LayoutGrid className="w-5 h-5" />
         </button>
         <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full m3-transition">
            <Settings className="w-5 h-5" />
         </button>
      </div>
    </nav>
  );
};

export default NavigationRail;