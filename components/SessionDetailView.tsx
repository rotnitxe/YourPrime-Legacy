// components/SessionDetailView.tsx
import React, { useMemo } from 'react';
import { useAppState } from '../contexts/AppContext';
import { Session, Program, Exercise } from '../types';
import { calculateIFI, calculateSessionVolume } from '../services/analysisService';
import Card from './ui/Card';
// FIX: Imported `DumbbellIcon` to fix a 'Cannot find name' error.
import { BrainIcon, BarChartIcon, TrendingUpIcon, SparklesIcon, CheckCircleIcon, DumbbellIcon } from './icons';
import { WorkoutVolumeAnalysis } from './WorkoutVolumeAnalysis';
import { ExerciseLink } from './ExerciseLink';

interface SessionDetailViewProps {
    sessionInfo: { programId: string; sessionId: string };
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ sessionInfo }) => {
    const { programs, history, exerciseList, muscleHierarchy } = useAppState();

    const { session, program } = useMemo(() => {
        const prog = programs.find(p => p.id === sessionInfo.programId);
        if (!prog) return { session: null, program: null };
        const sess = prog.macrocycles.flatMap(m => m.mesocycles.flatMap(meso => meso.weeks.flatMap(w => w.sessions))).find(s => s.id === sessionInfo.sessionId);
        return { session: sess, program: prog };
    }, [sessionInfo, programs]);

    const sessionAnalysis = useMemo(() => {
        if (!session) return null;

        const sessionLogs = history.filter(log => log.sessionId === session.id);
        if (sessionLogs.length < 2) return { avgIFI: null, improvementIndex: 0 };
        
        const ifis = session.exercises
            .map(ex => calculateIFI(ex, history, programs))
            .filter((ifi): ifi is number => ifi !== null);

        const avgIFI = ifis.length > 0 ? (ifis.reduce((a, b) => a + b, 0) / ifis.length) : null;
        
        const firstLog = sessionLogs[0];
        const lastLog = sessionLogs[sessionLogs.length - 1];

        const firstVolume = firstLog.completedExercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.completedReps || 0), 0), 0);
        const lastVolume = lastLog.completedExercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.completedReps || 0), 0), 0);

        const improvementIndex = firstVolume > 0 ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;

        return { avgIFI, improvementIndex };
    }, [session, history, programs]);

    const sessionVolumeAnalysis = useMemo(() => {
        if (!session) return null;
        return calculateSessionVolume(session, exerciseList, muscleHierarchy);
    }, [session, exerciseList, muscleHierarchy]);


    if (!session || !program) {
        return <div className="pt-24 text-center">Sesión no encontrada.</div>;
    }
    
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">{session.name}</h1>
                <p className="text-slate-400">Análisis detallado de la sesión</p>
            </header>

            <Card>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2"><BrainIcon/> Métricas Clave</h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-slate-300">IFI Promedio</p>
                        <p className="text-4xl font-bold text-primary-color">{sessionAnalysis?.avgIFI?.toFixed(1) ?? 'N/A'}</p>
                    </div>
                     <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-slate-300">Índice de Mejora</p>
                        <p className={`text-4xl font-bold ${sessionAnalysis && sessionAnalysis.improvementIndex >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sessionAnalysis ? `${sessionAnalysis.improvementIndex >= 0 ? '+' : ''}${sessionAnalysis.improvementIndex.toFixed(0)}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            </Card>

            {sessionVolumeAnalysis && <WorkoutVolumeAnalysis program={{...program, macrocycles: [{id: '', name: '', mesocycles: [{id: '', name: '', goal: 'Acumulación', weeks: [{id: '', name: '', sessions: [session]}]}]}]}} history={history} settings={{...program.background as any}} isOnline={true} />}

             <Card>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2"><DumbbellIcon /> Desglose por Ejercicio</h2>
                <div className="space-y-3">
                    {session.exercises.map(ex => {
                        const ifi = calculateIFI(ex, history, programs);
                        const exLogs = history.filter(log => log.completedExercises.some(ce => ce.exerciseId === ex.id));
                        const lastPerformance = exLogs.length > 0 ? exLogs[exLogs.length-1].completedExercises.find(ce => ce.exerciseId === ex.id)?.sets[0] : null;

                        return (
                            <div key={ex.id} className="glass-card-nested p-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-white"><ExerciseLink name={ex.name} /></h3>
                                    {ifi && <span className="text-sm font-bold bg-slate-700 px-2 py-1 rounded-full">IFI: {ifi.toFixed(1)}</span>}
                                </div>
                                {lastPerformance && (
                                    <p className="text-xs text-slate-400">
                                        Última vez: {lastPerformance.weight}kg x {lastPerformance.completedReps} reps @RPE {lastPerformance.completedRPE}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Card>
            
             <Card>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2"><SparklesIcon/> Recomendaciones del Coach</h2>
                 <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-start gap-2"><CheckCircleIcon size={16} className="text-green-400 mt-1 flex-shrink-0" /><p>El IFI promedio de <strong>{sessionAnalysis?.avgIFI?.toFixed(1)}</strong> indica una fatiga manejable. Considera aumentar el RPE en 0.5 en los ejercicios con IFI más bajo.</p></div>
                    <div className="flex items-start gap-2"><CheckCircleIcon size={16} className="text-green-400 mt-1 flex-shrink-0" /><p>Tu índice de mejora del <strong>{sessionAnalysis?.improvementIndex.toFixed(0)}%</strong> es excelente. Sigue aplicando sobrecarga progresiva en peso o repeticiones.</p></div>
                    <div className="flex items-start gap-2"><CheckCircleIcon size={16} className="text-green-400 mt-1 flex-shrink-0" /><p>El volumen de pectoral está en un rango óptimo. Para seguir progresando, podrías añadir una serie extra a las aperturas en la próxima fase de acumulación.</p></div>
                </div>
            </Card>
        </div>
    );
};

export default SessionDetailView;
