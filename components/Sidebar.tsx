import React from 'react';
import { View } from '../types';
import { XIcon, HomeIcon, SettingsIcon, CoachIcon, TrendingUpIcon, BookOpenIcon, DumbbellIcon, ClipboardListIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, navigate }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`sidebar-glass fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: 'var(--shadow-elevation-high)' }}
      >
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--primary-color-400)]">YourPrime</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('home')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <HomeIcon/> Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate('tasks')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <ClipboardListIcon/> Tareas
              </button>
            </li>
            <li>
              <button onClick={() => navigate('your-lab')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <DumbbellIcon/> YourLab
              </button>
            </li>
            <li>
              <button onClick={() => navigate('coach')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <CoachIcon/> Coach
              </button>
            </li>
            <li>
              <button onClick={() => navigate('progress')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <TrendingUpIcon/> Progreso Corporal
              </button>
            </li>
             <li>
              <button onClick={() => navigate('settings')} className="w-full text-left p-3 rounded-md text-lg text-slate-300 hover:bg-white/10 hover:text-[var(--primary-color-400)] transition flex items-center gap-3">
                <SettingsIcon/> Ajustes
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;