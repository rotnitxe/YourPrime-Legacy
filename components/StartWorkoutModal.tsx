// components/StartWorkoutModal.tsx
import React from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppContext';
import { Program, Session, ProgramWeek } from '../types';
import Modal from './ui/Modal';
import { ChevronRightIcon, PlayIcon } from './icons';
import Button from './ui/Button';

interface StartWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({ isOpen, onClose }) => {
    const { programs } = useAppState();
    const { handleStartWorkout, navigateTo } = useAppDispatch();

    const handleSessionClick = (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => {
        handleStartWorkout(session, program, weekVariant);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Entrenamiento">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                {programs.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        <p>No tienes programas. ¡Crea uno para empezar!</p>
                        <Button onClick={() => { navigateTo('program-editor'); onClose(); }} className="mt-4">Crear Programa</Button>
                    </div>
                )}
                {programs.map(program => (
                    <details key={program.id} className="glass-card !p-0" open={programs.length === 1}>
                        <summary className="p-4 cursor-pointer list-none flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg">{program.name}</h3>
                            <ChevronRightIcon className="details-arrow transition-transform" />
                        </summary>
                        <div className="border-t border-slate-700/50 p-2 space-y-2">
                            {program.macrocycles.flatMap(macro => 
                                macro.mesocycles.flatMap(meso => 
                                    meso.weeks.map(week => (
                                        <div key={week.id}>
                                            <h4 className="font-semibold text-primary-color text-sm px-2 mt-2">{week.name}{week.variant ? ` (Semana ${week.variant})` : ''}</h4>
                                            {week.sessions.map(session => (
                                                <div key={session.id} className="flex justify-between items-center p-2 hover:bg-slate-800/50 rounded-md">
                                                    <div>
                                                        <p className="text-slate-200">{session.name}</p>
                                                        <p className="text-xs text-slate-400">{session.exercises.length} ejercicios</p>
                                                    </div>
                                                    <button onClick={() => handleSessionClick(session, program, week.variant)} className="p-2 text-green-400 hover:text-green-300">
                                                        <PlayIcon size={24}/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </details>
                ))}
            </div>
        </Modal>
    );
};

export default StartWorkoutModal;