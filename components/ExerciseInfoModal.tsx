// components/ExerciseInfoModal.tsx
import React from 'react';
import { ExerciseMuscleInfo } from '../types';
import Modal from './ui/Modal';

const MuscleActivationView: React.FC<{
    involvedMuscles: ExerciseMuscleInfo['involvedMuscles'];
}> = ({ involvedMuscles = [] }) => {
    
    const roleConfig = {
        primary: { label: 'Primarios', color: 'bg-green-500' },
        secondary: { label: 'Secundarios', color: 'bg-sky-500' },
        stabilizer: { label: 'Estabilizadores', color: 'bg-emerald-500' },
    };

    const groupedByRole = involvedMuscles.reduce((acc, muscle) => {
        if (!acc[muscle.role]) {
            acc[muscle.role] = [];
        }
        acc[muscle.role].push(muscle);
        return acc;
    }, {} as Record<string, typeof involvedMuscles>);

    return (
        <div className="space-y-4">
            {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map(role => {
                const muscles = groupedByRole[role];
                if (!muscles || muscles.length === 0) return null;
                
                return (
                    <div key={role}>
                        <h4 className={`font-bold text-lg mb-2 text-white`}>{roleConfig[role].label}</h4>
                        <div className="space-y-2">
                        {muscles.sort((a,b) => b.activation - a.activation).map((m, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1 text-sm">
                                    <span className="font-semibold text-slate-300">{m.muscle}</span>
                                    <span className="font-mono text-slate-400">{Math.round(m.activation * 100)}%</span>
                                </div>
                                <div className={`w-full bg-slate-700 rounded-full h-2.5`}>
                                    <div className={`${roleConfig[role].color} h-2.5 rounded-full`} style={{ width: `${m.activation * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const ExerciseInfoModal: React.FC<{
  exercise: ExerciseMuscleInfo | null;
  onClose: () => void;
}> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise.name}>
      <div className="p-2 space-y-4">
        <p className="text-slate-300">{exercise.description}</p>
        <div className="glass-card-nested p-4">
            <h3 className="font-bold text-lg text-white mb-3">Activación Muscular</h3>
            <MuscleActivationView involvedMuscles={exercise.involvedMuscles} />
        </div>
      </div>
    </Modal>
  );
};

export default ExerciseInfoModal;