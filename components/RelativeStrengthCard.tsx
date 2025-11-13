// components/RelativeStrengthCard.tsx
import React, { useMemo } from 'react';
import { WorkoutLog, Settings } from '../types';
import { calculateBrzycki1RM } from '../utils/calculations';
import Card from './ui/Card';
import { DumbbellIcon } from './icons';

interface RelativeStrengthCardProps {
  history: WorkoutLog[];
  settings: Settings;
}

const RelativeStrengthCard: React.FC<RelativeStrengthCardProps> = ({ history, settings }) => {
    const bodyWeight = settings.userVitals?.weight;
    const unit = settings.weightUnit;

    const relativeStrengthData = useMemo(() => {
        if (!bodyWeight || bodyWeight <= 0) {
            return null;
        }

        const coreLifts = [
            { name: 'Press de Banca', keywords: ['press de banca', 'bench press'] },
            { name: 'Sentadilla', keywords: ['sentadilla', 'squat'] },
            { name: 'Peso Muerto', keywords: ['peso muerto', 'deadlift'] },
        ];

        return coreLifts.map(lift => {
            let best1RM = 0;

            history.forEach(log => {
                log.completedExercises.forEach(ex => {
                    const exerciseNameLower = ex.exerciseName.toLowerCase();
                    if (lift.keywords.some(kw => exerciseNameLower.startsWith(kw))) {
                        ex.sets.forEach(set => {
                            if (set.weight && typeof set.completedReps === 'number' && set.completedReps > 0) {
                                const e1RM = calculateBrzycki1RM(set.weight, set.completedReps);
                                if (e1RM > best1RM) {
                                    best1RM = e1RM;
                                }
                            }
                        });
                    }
                });
            });

            return {
                name: lift.name,
                best1RM: Math.round(best1RM),
                relativeStrength: best1RM > 0 ? (best1RM / bodyWeight).toFixed(2) : 'N/A',
            };
        }).filter(item => item.best1RM > 0);

    }, [history, bodyWeight]);

    if (!relativeStrengthData) {
        return (
             <Card>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><DumbbellIcon/> Fuerza Relativa</h3>
                <p className="text-center text-sm text-slate-400 py-4">
                    Registra tu peso corporal en la pestaña "Progreso" para ver tu fuerza relativa.
                </p>
            </Card>
        );
    }
    
    if (relativeStrengthData.length === 0) {
        return null; // Don't show the card if no data for core lifts is available
    }

    return (
        <Card>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><DumbbellIcon/> Fuerza Relativa</h3>
            <div className="space-y-3">
                {relativeStrengthData.map(data => (
                    <div key={data.name} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                        <div>
                            <p className="font-semibold text-white">{data.name}</p>
                            <p className="text-xs text-slate-400">1RMe: {data.best1RM}{unit}</p>
                        </div>
                        <p className="text-2xl font-black text-primary-color">{data.relativeStrength}x</p>
                    </div>
                ))}
                <p className="text-xs text-slate-500 text-center pt-2">Tu 1RM estimado en relación a tu peso corporal.</p>
            </div>
        </Card>
    );
};

export default RelativeStrengthCard;