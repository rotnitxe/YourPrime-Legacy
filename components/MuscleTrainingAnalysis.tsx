// components/MuscleTrainingAnalysis.tsx
import React, { useState, useMemo } from 'react';
import { useAppState } from '../contexts/AppContext';
import { generateMuscleGroupAnalysis } from '../services/aiService';
import { MuscleGroupAnalysis, WorkoutLog, Exercise } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { SparklesIcon, CheckCircleIcon, TrendingUpIcon, BarChartIcon } from './icons';
import SkeletonLoader from './ui/SkeletonLoader';
import { getWeekId } from '../utils/calculations';

interface MuscleTrainingAnalysisProps {
    muscleName: string;
}

const MuscleTrainingAnalysis: React.FC<MuscleTrainingAnalysisProps> = ({ muscleName }) => {
    const { history, programs, settings, isOnline, exerciseList, muscleHierarchy } = useAppState();
    const [analysis, setAnalysis] = useState<MuscleGroupAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const relevantExercises = useMemo(() => {
        const lowerMuscleName = muscleName.toLowerCase();
        let childMuscles: string[] = [];

        // Find if the current muscle is a parent and get its children
        Object.values(muscleHierarchy.bodyPartHierarchy).flat().forEach(group => {
            if (typeof group === 'object' && group !== null) {
                const parent = Object.keys(group)[0];
                if (parent.toLowerCase() === lowerMuscleName) {
                    childMuscles = Object.values(group)[0].map(m => m.toLowerCase());
                }
            }
        });
        
        const relevantMuscleNames = [lowerMuscleName, ...childMuscles];

        return exerciseList
            .filter(ex => ex.involvedMuscles.some(m => relevantMuscleNames.includes(m.muscle.toLowerCase()) && m.role === 'primary'))
            .map(ex => ex.id);
    }, [muscleName, exerciseList, muscleHierarchy]);

    const handleAnalyze = async () => {
        if (!isOnline) {
            setError("Se requiere conexión a internet.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const fourWeeksAgo = new Date();
            fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

            const recentHistory = history.filter(log => new Date(log.date) >= fourWeeksAgo);
            const relevantLogs = recentHistory.filter(log => log.completedExercises.some(ex => relevantExercises.includes(ex.exerciseId) || relevantExercises.includes(ex.exerciseDbId || '')));

            if (relevantLogs.length < 2) {
                throw new Error("Se necesitan al menos 2 entrenamientos para este músculo en el último mes para un análisis significativo.");
            }

            const weeklyData = relevantLogs.reduce((acc, log) => {
                const weekId = getWeekId(new Date(log.date), settings.startWeekOn);
                if (!acc[weekId]) {
                    acc[weekId] = { volume: 0, sessions: new Set() };
                }
                acc[weekId].sessions.add(log.sessionId);
                log.completedExercises.forEach(ex => {
                    if (relevantExercises.includes(ex.exerciseId) || relevantExercises.includes(ex.exerciseDbId || '')) {
                        acc[weekId].volume += ex.sets.reduce((vol, set) => vol + (set.weight || 0) * (set.completedReps || 0), 0);
                    }
                });
                return acc;
            }, {} as Record<string, { volume: number, sessions: Set<string> }>);
            
            const weeks = Object.keys(weeklyData).sort();
            const firstWeekVolume = weeklyData[weeks[0]]?.volume || 0;
            const lastWeekVolume = weeklyData[weeks[weeks.length - 1]]?.volume || 0;
            const volumeTrend = firstWeekVolume > 0 ? ((lastWeekVolume - firstWeekVolume) / firstWeekVolume) * 100 : 0;
            const frequency = weeks.reduce((sum, weekId) => sum + weeklyData[weekId].sessions.size, 0) / weeks.length;
            
            const trainingData = {
                muscleName,
                frequency: parseFloat(frequency.toFixed(1)),
                volumeTrend: Math.round(volumeTrend),
                exercises: [...new Set(relevantLogs.flatMap(log => log.completedExercises.filter(ex => relevantExercises.includes(ex.exerciseId) || relevantExercises.includes(ex.exerciseDbId || '')).map(e => e.exerciseName)))]
            };

            const result = await generateMuscleGroupAnalysis(muscleName, trainingData, settings);
            // FIX: Add missing properties to align with the updated MuscleGroupAnalysis type.
            setAnalysis({...result, frequency: trainingData.frequency, volumeTrend: trainingData.volumeTrend, loadProgression: 0}); // Load progression is complex, simplify for now

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al generar el análisis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getAssessmentColor = (assessment: MuscleGroupAnalysis['assessment']) => {
        switch(assessment) {
            case 'Optimo': return 'text-green-400';
            case 'Sobrecargado': return 'text-red-400';
            case 'Subentrenado': return 'text-yellow-400';
            default: return 'text-slate-400';
        }
    }

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <SparklesIcon/> Análisis de Entrenamiento IA
            </h3>
            
            {isLoading && <SkeletonLoader lines={4} />}
            {error && <p className="text-red-400 mt-2 text-center text-sm">{error}</p>}
            
            {analysis && !isLoading && (
                <div className="space-y-4 animate-fade-in">
                    <div className="text-center p-3 rounded-lg bg-slate-900/50">
                        <p className="text-sm font-semibold text-slate-300">Evaluación General</p>
                        <p className={`text-3xl font-bold ${getAssessmentColor(analysis.assessment)}`}>{analysis.assessment}</p>
                        <p className="text-xs text-slate-400 italic mt-1">"{analysis.summary}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-slate-800/50 p-2 rounded-lg">
                             <p className="text-2xl font-bold font-mono text-white flex items-center justify-center gap-1">
                                {analysis.frequency}x
                            </p>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Frecuencia Semanal</p>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded-lg">
                             <p className="text-2xl font-bold font-mono text-white flex items-center justify-center gap-1">
                                {analysis.volumeTrend >= 0 ? '+' : ''}{analysis.volumeTrend}%
                            </p>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Tendencia Volumen</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-primary-color flex items-center gap-2 mb-1"><CheckCircleIcon size={16}/> Recomendaciones</h4>
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                            {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </div>
                </div>
            )}
            
            {!isLoading && !analysis && !error && (
                 <div className="text-center py-4 space-y-3">
                    <p className="text-sm text-slate-400">Analiza tu entrenamiento del último mes para este grupo muscular.</p>
                    <Button onClick={handleAnalyze} disabled={!isOnline || history.length < 2}>
                        <SparklesIcon size={16}/> Analizar mi Entrenamiento
                    </Button>
                </div>
             )}
        </Card>
    );
};

export default MuscleTrainingAnalysis;
