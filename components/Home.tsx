
import React, { useEffect, useState } from 'react';
import { useAppContext, useAppDispatch } from '../contexts/AppContext';
import { View, Program } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { PlayIcon, CalendarIcon, ChevronRightIcon, ActivityIcon, ZapIcon, TrendingUpIcon, ClipboardListIcon } from './icons';
import MuscleRecoveryWidget from './MuscleRecoveryWidget'; 

interface HomeProps {
  onNavigate: (view: View, program?: Program) => void;
  onResumeWorkout: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onResumeWorkout }) => { 
    const { ongoingWorkout, programs, settings, history } = useAppContext(); 
    const { handleStartWorkout } = useAppDispatch(); 
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Buenos días');
        else if (hour < 20) setGreeting('Buenas tardes');
        else setGreeting('Buenas noches');
    }, []);

    // Encontrar la sesión de hoy (Lógica simplificada V3)
    // We assume the first program is the active one for simplicity in this context, 
    // or we could track activeProgramId in state if strictly needed. 
    // Adapting the path to match the actual type structure: Macrocycle -> Mesocycle -> Weeks -> Sessions
    const activeProgram = programs[0]; // Simplified fallback to first program
    const todaySession = activeProgram?.macrocycles[0]?.mesocycles[0]?.weeks[0]?.sessions[0]; 

    return (
        <div className="pb-32 px-4 pt-4 space-y-6 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="flex justify-between items-center mt-2">
                <div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</p>
                    <h1 className="text-3xl font-black text-white">{greeting}, Atleta</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                    <span className="font-bold text-xs">{settings.userVitals?.weight || '?'}kg</span>
                </div>
            </div>
            
            {/* Hero Card: Estado del Entrenamiento */}
            {ongoingWorkout ? (
                <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-6 shadow-2xl shadow-indigo-900/40">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold text-white border border-white/10 backdrop-blur-sm animate-pulse">
                                <ActivityIcon size={12} /> EN CURSO
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-1">{ongoingWorkout.session.name}</h2>
                        <p className="text-indigo-200 text-sm mb-6 line-clamp-1">{ongoingWorkout.programId ? 'Programa Activo' : 'Sesión Libre'}</p>
                        
                        <Button onClick={onResumeWorkout} className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none shadow-lg">
                            Reanudar Sesión
                        </Button>
                    </div>
                </div>
            ) : todaySession ? (
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
                    {/* Imagen de fondo del programa si existe */}
                    {activeProgram?.coverImage && (
                        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${activeProgram.coverImage})` }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                    <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">{activeProgram?.name}</p>
                        <h2 className="text-3xl font-black text-white mb-2 leading-none">{todaySession.name}</h2>
                        <div className="flex gap-2 mb-6 text-sm text-slate-300">
                            <span className="flex items-center gap-1"><ZapIcon size={14} className="text-yellow-500"/> {todaySession.exercises.length} Ejercicios</span>
                        </div>
                        <Button onClick={() => handleStartWorkout(todaySession, activeProgram!)} className="w-full" size="lg">
                            <PlayIcon className="mr-2" size={20}/> Empezar Entreno
                        </Button>
                    </div>
                </div>
            ) : (
                <Card variant="glass" className="flex flex-col items-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                        <CalendarIcon size={32} className="text-slate-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Día de Descanso</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-[200px]">Aprovecha para recuperar o inicia una sesión libre.</p>
                    <Button variant="secondary" onClick={() => onNavigate('programs')}>Ver Programas</Button>
                </Card>
            )}
            
            {/* Widgets Grid */}
            <div className="grid grid-cols-1 gap-4">
                {/* Widget de Recuperación */}
                <MuscleRecoveryWidget />
                
                {/* Acceso Rápido */}
                <div className="grid grid-cols-2 gap-4">
                    <Card variant="outline" className="p-4 active:scale-95 transition-transform cursor-pointer" onClick={() => onNavigate('progress')}>
                        <div className="bg-green-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-green-500"><TrendingUpIcon size={20}/></div>
                        <h4 className="font-bold text-white text-sm">Mi Progreso</h4>
                        <p className="text-xs text-slate-500">Ver estadísticas</p>
                    </Card>
                    <Card variant="outline" className="p-4 active:scale-95 transition-transform cursor-pointer" onClick={() => onNavigate('feed')}>
                        <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-blue-500"><ClipboardListIcon size={20}/></div>
                        <h4 className="font-bold text-white text-sm">Historial</h4>
                        <p className="text-xs text-slate-500">{history.length} sesiones</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}; 

export default Home;
