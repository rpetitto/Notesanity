import React from 'react';
import { Classroom } from '../types';
import { Book, GraduationCap, Plus } from 'lucide-react';

interface BinderSidebarProps {
  classes: Classroom[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
}

const BinderSidebar: React.FC<BinderSidebarProps> = ({ classes, selectedClassId, onSelectClass }) => {
  return (
    <div className="w-[80px] bg-slate-900 flex flex-col items-center py-6 h-full border-r border-slate-800 shrink-0">
      <div className="mb-8 p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
        <GraduationCap className="text-white w-6 h-6" />
      </div>

      <div className="flex flex-col gap-4 w-full items-center overflow-y-auto px-2">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group
              ${selectedClassId === cls.id 
                ? 'ring-2 ring-offset-2 ring-offset-slate-900 scale-110' 
                : 'hover:scale-105 opacity-80 hover:opacity-100'}
            `}
            style={{ 
              backgroundColor: cls.color,
              boxShadow: selectedClassId === cls.id ? `0 0 15px ${cls.color}60` : 'none'
            }}
            title={cls.name}
          >
            <Book className="w-5 h-5 text-white/90" />
            
            {/* Tooltip */}
            <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {cls.name}
            </div>
          </button>
        ))}

        <button className="w-12 h-12 rounded-full border-2 border-slate-700 border-dashed flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors mt-2" title="Add Class (Syncs from Classroom)">
            <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BinderSidebar;