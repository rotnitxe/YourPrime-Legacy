
import React from 'react';
import { useQuery } from '@tanstack/react-query';
// Nota: En Next.js App Router, usaríamos useSearchParams de 'next/navigation'
// Simulamos el hook para este contexto o usamos window.location si es SPA puro
import { getWorkoutHistoryAction } from '@/actions/workout';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CalendarIcon, ClockIcon } from '@/components/icons';

export const WorkoutHistoryList: React.FC = () => {
  // Simulación de lectura de URL Search Params
  const searchParams = new URLSearchParams(window.location.search);
  const filterDate = searchParams.get('date');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workout-history', filterDate], // La key incluye el filtro, refetch automático al cambiar URL
    queryFn: () => getWorkoutHistoryAction(), // Aquí pasaríamos el filtro a la action
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    );
  }

  if (isError) return <div className="text-red-400 p-4 border border-red-900 rounded bg-red-900/20">Error al cargar el historial.</div>;

  const history = data?.data?.items || [];

  return (
    <div className="space-y-4">
        {history.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay entrenamientos registrados.</p>
        ) : (
            history.map((log: any) => (
                <div key={log.id} className={`p-4 rounded-xl border border-slate-800 bg-card-bg-main hover:border-primary-color/50 transition-colors ${log.status === 'pending' ? 'opacity-70' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-white text-lg">{log.sessionName}</h3>
                            <p className="text-xs text-primary-color">{log.programName}</p>
                        </div>
                        <div className="flex items-center text-xs text-slate-400 gap-1 bg-slate-900 px-2 py-1 rounded">
                            <CalendarIcon size={12} />
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-sm text-slate-300">
                         <div className="flex items-center gap-1">
                            <ClockIcon size={14} className="text-slate-500"/>
                            <span>{Math.round(log.durationSeconds / 60)} min</span>
                         </div>
                         <div className="flex items-center gap-1">
                             <span className="font-bold text-white">{log.completedExercises?.length || 0}</span> Ejercicios
                         </div>
                    </div>
                </div>
            ))
        )}
    </div>
  );
};
