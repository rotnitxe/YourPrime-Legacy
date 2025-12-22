import React, { useMemo, useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { calculateMuscleBattery, calculateSystemicFatigue } from '../services/recoveryService';
import Card from './ui/Card';
import { ActivityIcon, ChevronRightIcon, BrainIcon } from './icons';
import SkeletonLoader from './ui/SkeletonLoader';
const BODY_PART_GROUPS: Record<string, string[]> = { 'Pecho': ['Pectorales'], 'Espalda': ['Dorsales', 'Trapecio'], 'Piernas': ['Cuádriceps', 'Isquiosurales', 'Glúteos'], 'Hombros': ['Deltoides'], 'Brazos': ['Bíceps', 'Tríceps'] };

const MuscleRecoveryWidget: React.FC = () => { const { history, exerciseList, isAppLoading, sleepLogs, postSessionFeedback, muscleHierarchy } = useAppState();

const cnsData = useMemo(() => {
    if (isAppLoading || !history || !exerciseList) return null;
    return calculateSystemicFatigue(history, exerciseList, sleepLogs);
}, [history, exerciseList, sleepLogs, isAppLoading]);
const muscleData = useMemo(() => {
    if (isAppLoading || !history || !exerciseList) return [];
    const allMuscles = Object.values(BODY_PART_GROUPS).flat();
    return allMuscles.map(muscleName => ({
        muscleName,
        ...calculateMuscleBattery(muscleName, history, exerciseList, sleepLogs, postSessionFeedback || [], muscleHierarchy)
    })).sort((a, b) => a.recoveryScore - b.recoveryScore).slice(0, 5);
}, [history, exerciseList, isAppLoading]);
const getBarColor = (score: number) => score < 40 ? 'bg-red-500' : score < 85 ? 'bg-yellow-500' : 'bg-green-500';
const getTextColor = (score: number) => score < 40 ? 'text-red-400' : score < 85 ? 'text-yellow-400' : 'text-green-400';
if (isAppLoading) return <Card><SkeletonLoader lines={4} /></Card>;
return (
    <Card className="!p-0 overflow-hidden border border-slate-800 bg-[#0A0A0A]">
        <div className="p-4 bg-slate-900/60 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3"><ActivityIcon className="text-primary-color" /><div><h3 className="font-bold text-white">Batería Muscular</h3><p className="text-[10px] text-slate-400">Estado actual</p></div></div>
        </div>
        {cnsData && (
            <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-800/50">
                <div className="flex justify-between items-center mb-1.5"><div className="flex items-center gap-2 text-slate-300 text-xs uppercase"><BrainIcon size={14}/><span>Sistema Nervioso</span></div><span className="text-xs font-mono text-white font-bold">{cnsData.score}%</span></div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden"><div className={`h-full bg-blue-500`} style={{ width: `${cnsData.score}%` }}/></div>
            </div>
        )}
        <div className="p-4 space-y-3">
            {muscleData.map((muscle) => (
                <div key={muscle.muscleName} className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full ${getBarColor(muscle.recoveryScore)}`}></div><p className="text-sm font-bold text-slate-200">{muscle.muscleName}</p></div>
                    <div className="flex items-center gap-3"><div className="hidden sm:block w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden"><div className={`h-full ${getBarColor(muscle.recoveryScore)}`} style={{ width: `${muscle.recoveryScore}%` }} /></div><span className={`text-sm font-mono font-bold w-9 text-right ${getTextColor(muscle.recoveryScore)}`}>{muscle.recoveryScore}%</span></div>
                </div>
            ))}
        </div>
    </Card>
);
}; export default MuscleRecoveryWidget;