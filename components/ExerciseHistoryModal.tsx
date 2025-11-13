import React from 'react';
import { Exercise, WorkoutLog, Settings } from '../types';
import Modal from './ui/Modal';
import { BarChartIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExerciseHistoryModalProps {
    exercise: Exercise;
    programId: string;
    history: WorkoutLog[];
    settings: Settings;
    onClose: () => void;
}

const ExerciseHistoryModal: React.FC<ExerciseHistoryModalProps> = ({ exercise, programId, history, settings, onClose }) => {
    // 1. Filter history for this specific exercise within the specific program
    const exerciseHistory = React.useMemo(() => {
        return history
            .filter(log => log.programId === programId) // Filter by program
            .map(log => {
                // Find the completed exercise in the log by ID, falling back to name
                const completedEx = log.completedExercises.find(
                    ce => ce.exerciseId === exercise.id
                );
                if (completedEx) {
                    return {
                        date: log.date,
                        sets: completedEx.sets
                    };
                }
                return null;
            })
            .filter((log): log is { date: string; sets: any[] } => log !== null) // Type guard to remove nulls
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent first
    }, [history, programId, exercise.id]);

    // 2. Prepare data for the chart (max weight per session)
    const chartData = React.useMemo(() => {
        return [...exerciseHistory]
            .reverse() // Reverse for chronological order in the chart
            .map(log => {
                const maxWeight = Math.max(...(log.sets.map(s => s.weight || 0)));
                return {
                    date: new Date(log.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                    'Peso Máximo': maxWeight > 0 ? maxWeight : null, // Use null to break the line if no weight was lifted
                };
            })
            .filter(d => d['Peso Máximo'] !== null);
    }, [exerciseHistory]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Historial de: ${exercise.name}`}>
            <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Chart Section */}
                {chartData.length > 1 ? (
                    <div>
                        <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><BarChartIcon size={16}/> Progresión de Peso Máximo</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" domain={['dataMin - 5', 'auto']} unit={settings.weightUnit} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Peso Máximo" stroke="var(--primary-color-400)" strokeWidth={2} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 text-sm p-4">
                        Completa más sesiones para ver un gráfico de progresión.
                    </div>
                )}

                {/* Log List Section */}
                <div className="space-y-3">
                    {exerciseHistory.length > 0 ? (
                        exerciseHistory.map((log, index) => (
                            <div key={index} className="bg-slate-900/70 p-3 rounded-md">
                                <p className="font-bold text-slate-300 text-sm mb-2">{new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <ul className="space-y-1 text-xs">
                                    {log.sets.map((set, setIndex) => {
                                        if (set.completedReps === undefined || set.weight === undefined) return null;
                                        return (
                                            <li key={set.id} className="flex justify-between items-center bg-slate-800 p-1.5 rounded">
                                                <span><span className="font-bold text-slate-400">Set {setIndex + 1}:</span> {set.weight}{settings.weightUnit} x {set.completedReps} reps</span>
                                                <div className="flex items-center gap-2">
                                                    {set.completedRPE && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">RPE {set.completedRPE}</span>}
                                                    {set.completedRIR && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">RIR {set.completedRIR}</span>}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-400 p-8">No hay historial para este ejercicio en este programa todavía.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ExerciseHistoryModal;