
import React from 'react';
import { View } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { HomeIcon, ClipboardListIcon, TrendingUpIcon, SettingsIcon, DumbbellIcon } from './icons';

const TabBar: React.FC = () => { 
    const { view, navigateTo, ongoingWorkout } = useAppContext();

    const tabs = [
        { id: 'home', icon: HomeIcon, label: 'Inicio' },
        { id: 'programs', icon: ClipboardListIcon, label: 'Rutinas' },
        { id: 'workout', icon: DumbbellIcon, label: 'Entreno', isSpecial: true },
        { id: 'progress', icon: TrendingUpIcon, label: 'Progreso' },
        { id: 'settings', icon: SettingsIcon, label: 'Perfil' },
    ];

    if (view === 'workout' || view === 'session-editor') return null; // Ocultar en entreno

    return (
        <div className="fixed bottom-6 left-4 right-4 h-16 rounded-2xl glass-dark flex items-center justify-around px-2 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
            {tabs.map((tab) => {
                const isActive = view === tab.id;
                const Icon = tab.icon;
                
                if (tab.isSpecial) {
                    return (
                        <button key={tab.id} onClick={() => navigateTo('workout')} className="relative -top-6 bg-gradient-to-tr from-violet-600 to-indigo-500 w-14 h-14 rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white border-4 border-black active:scale-95 transition-transform">
                            <Icon size={24} className={ongoingWorkout ? "animate-pulse" : ""} />
                        </button>
                    );
                }
                return (
                    <button 
                        key={tab.id} 
                        onClick={() => navigateTo(tab.id as View)}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive ? 'text-indigo-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </button>
                );
            })}
        </div>
    );
}; 

export default TabBar;
