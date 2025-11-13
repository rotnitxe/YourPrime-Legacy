

import React from 'react';
import { Program } from '../types';
import { PlayIcon, ChevronRightIcon } from './icons';
import Card from './ui/Card';

interface ProgramsViewProps {
  programs: Program[];
  onSelectProgram: (program: Program) => void;
  onCreateProgram: () => void;
  isOnline: boolean;
}

const ProgramsView: React.FC<ProgramsViewProps> = ({ programs, onSelectProgram, onCreateProgram, isOnline }) => {

  const renderContent = () => {
    if (programs.length === 0) {
      return (
        <Card title="Programas" className="text-center py-12">
            <h3 className="text-xl font-semibold">¡Aún no tienes programas!</h3>
            <p className="mt-2">Empieza creando tu primer programa de entrenamiento.</p>
            <button 
                onClick={onCreateProgram}
                className="mt-6 bg-[var(--primary-color-500)] hover:bg-[var(--primary-color-600)] text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105 focus:outline-none focus:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[var(--primary-color-500)]"
            >
                Crear Programa
            </button>
        </Card>
      );
    }
    
    return (
        <div className="space-y-3">
            {programs.map((program) => {
                const allWeeks = program.macrocycles.flatMap(m => m.mesocycles.flatMap(meso => meso.weeks));
                const totalSessions = allWeeks.reduce((acc, week) => acc + week.sessions.length, 0);
                
                return (
                    <div 
                        key={program.id} 
                        onClick={() => onSelectProgram(program)} 
                        className="section-card-item cursor-pointer"
                        style={{ viewTransitionName: `program-card-${program.id}` } as React.CSSProperties}
                    >
                       <div className="flex items-center">
                            <img src={program.coverImage || 'favicon.svg'} alt={program.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                            <div className="flex-grow">
                                <h3 className="font-bold text-white text-lg">{program.name}</h3>
                                <p className="text-sm text-slate-400">{allWeeks.length} semanas, {totalSessions} sesiones</p>
                            </div>
                            <ChevronRightIcon className="text-slate-500" />
                       </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider">Programas</h1>
            <button
                onClick={onCreateProgram}
                className="bg-[var(--primary-color-500)] hover:bg-[var(--primary-color-600)] text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105 focus:outline-none"
            >
                Crear Nuevo
            </button>
        </div>
        {renderContent()}
    </div>
  );
};

export default React.memo(ProgramsView);