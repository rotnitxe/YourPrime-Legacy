
// components/Home.tsx
import React, { useMemo } from 'react';
import { Program, Session, WorkoutLog, Settings, View, OngoingWorkoutState, BodyLabAnalysis, ProgramWeek } from '../types';
import PerformanceScore from './PerformanceScore';
import Card from './ui/Card';
import Button from './ui/Button';
import { 
    PlayIcon, FlameIcon, TrophyIcon, ClockIcon, BarChartIcon, 
    PlusIcon, ChevronRightIcon, PauseIcon, BrainIcon, 
    SparklesIcon, TrendingUpIcon, ActivityIcon, ZapIcon, ArrowUpIcon, ArrowDownIcon 
} from './icons';
import { formatLargeNumber, getWeekId, calculateStreak } from '../utils/calculations';
import OnThisDayCard from './OnThisDayCard';
import RelativeStrengthCard from './RelativeStrengthCard';
import { useAppState, useAppDispatch } from '../contexts/AppContext';

// --- SUB-COMPONENTS FOR DASHBOARD ---

const AthleteStatusWidget: React.FC<{ history: WorkoutLog[] }> = ({ history }) => {
    const status = useMemo(() => {
        if (!history || history.length === 0) return { label: 'Fresco', color: 'text-green-400', percentage: 100, message: 'Listo para tu primer entreno.' };

        const lastWorkout = new Date(history[history.length - 1].date);
        const now = new Date();
        const hoursSince = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

        if (hoursSince < 20) {
            return { label: 'Recuperando', color: 'text-yellow-400', percentage: 45, message: 'Descansa e hidrátate.' };
        } else if (hoursSince < 40) {
            return { label: 'Bueno', color: 'text-blue-400', percentage: 80, message: 'El cuerpo está listo.' };
        } else {
            return { label: 'PRIME', color: 'text-[var(--primary-color)]', percentage: 100, message: 'Máximo potencial disponible.' };
        }
    }, [history]);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-5 shadow-lg">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <ActivityIcon size={80} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Estado del Atleta</p>
                    <h2 className={`text-4xl font-display uppercase mt-1 ${status.color} drop-shadow-md`}>{status.label}</h2>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm text-slate-300">{status.message}</span>
                        <span className="text-xl font-bold font-display text-white">{status.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${status.color.replace('text-', 'bg-')}`} 
                            style={{ width: `${status.percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ label: string; value: string; trend?: number; icon: any }> = ({ label, value, trend, icon: Icon }) => (
    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col justify-between h-24 relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className="absolute top-2 right-2 text-slate-700 group-hover:text-slate-600 transition-colors">
            <Icon size={24} />
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</p>
        <div>
            <p className="text-2xl font-display text-white">{value}</p>
            {trend !== undefined && (
                <div className={`flex items-center gap-0.5 text-[10px] font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <ArrowUpIcon size={10}/> : <ArrowDownIcon size={10}/>}
                    {Math.abs(trend)}% vs sem. ant.
                </div>
            )}
        </div>
    </div>
);

const WeeklyKPIs: React.FC<{ history: WorkoutLog[], settings: Settings }> = ({ history, settings }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(getWeekId(now, settings.startWeekOn).split('-').join('/'));
        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        const thisWeekLogs = history.filter(log => new Date(log.date) >= startOfWeek);
        const lastWeekLogs = history.filter(log => {
            const d = new Date(log.date);
            return d >= startOfLastWeek && d < startOfWeek;
        });

        const calcVolume = (logs: WorkoutLog[]) => logs.reduce((acc, log) => acc + log.completedExercises.reduce((exAcc, ex) => exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.completedReps || 0), 0), 0), 0);
        
        const volThisWeek = calcVolume(thisWeekLogs);
        const volLastWeek = calcVolume(lastWeekLogs);
        const volTrend = volLastWeek > 0 ? Math.round(((volThisWeek - volLastWeek) / volLastWeek) * 100) : 0;

        return {
            volume: formatLargeNumber(volThisWeek),
            volumeTrend: volTrend,
            sessions: thisWeekLogs.length,
            calories: thisWeekLogs.reduce((acc, log) => acc + (log.caloriesBurned || 0), 0)
        };
    }, [history, settings]);

    return (
        <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Carga (Vol)" value={stats.volume} trend={stats.volumeTrend} icon={TrophyIcon} />
            <MetricCard label="Sesiones" value={stats.sessions.toString()} icon={BarChartIcon} />
            <MetricCard label="Kcal Quemadas" value={stats.calories.toString()} icon={FlameIcon} />
        </div>
    );
};

const QuickActions: React.FC<{ 
    nextSession: { program: Program, session: Session, weekVariant?: ProgramWeek['variant'] } | null,
    onStart: any,
    onNavigate: any 
}> = ({ nextSession, onStart, onNavigate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                {nextSession ? (
                    <button 
                        onClick={() => onStart(nextSession.session, nextSession.program, nextSession.weekVariant)}
                        className="w-full h-full min-h-[100px] relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--primary-color)] to-blue-600 p-6 flex flex-col justify-center items-start text-left shadow-[0_0_20px_rgba(0,229,255,0.2)] group transition-transform active:scale-[0.98]"
                    >
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                            <PlayIcon size={120} className="text-black" />
                        </div>
                        <span className="relative z-10 text-xs font-bold uppercase text-black/60 mb-1 flex items-center gap-1"><ZapIcon size={12}/> Próxima Sesión</span>
                        <h3 className="relative z-10 text-2xl md:text-3xl font-display text-white uppercase leading-none">{nextSession.session.name}</h3>
                        <p className="relative z-10 text-sm text-white/80 mt-1 font-medium">{nextSession.program.name}</p>
                    </button>
                ) : (
                    <button 
                         onClick={() => onNavigate('programs')}
                         className="w-full h-full min-h-[100px] rounded-2xl bg-slate-800 border border-slate-700 p-6 flex flex-col justify-center items-center text-center hover:bg-slate-700 transition-colors"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Planificar Entrenamiento</h3>
                        <p className="text-sm text-slate-400">Selecciona o crea un programa para hoy</p>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                <button onClick={() => onNavigate('program-editor')} className="bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
                    <PlusIcon className="text-slate-400 group-hover:text-white" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Crear Rutina</span>
                </button>
                <button onClick={() => onNavigate('progress')} className="bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
                    <TrendingUpIcon className="text-slate-400 group-hover:text-white" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Ver Progreso</span>
                </button>
            </div>
        </div>
    );
};

const ResumeWorkoutCard: React.FC<{ ongoingWorkout: OngoingWorkoutState, onResume: () => void }> = ({ ongoingWorkout, onResume }) => {
    return (
        <div className="animate-pulse-border rounded-2xl bg-slate-900 border border-yellow-500/50 p-4 flex items-center justify-between shadow-lg shadow-yellow-900/20 mb-6">
            <div>
                <p className="text-xs font-bold text-yellow-500 uppercase flex items-center gap-1"><PauseIcon size={12}/> En Pausa</p>
                <h3 className="text-lg font-bold text-white">{ongoingWorkout.session.name}</h3>
            </div>
            <Button onClick={onResume} className="!py-2 !px-4 !text-sm">Reanudar</Button>
        </div>
    );
};

const BodyLabWidget: React.FC<{ analysis: BodyLabAnalysis | null, onNavigate: (view: View) => void }> = ({ analysis, onNavigate }) => {
    if (!analysis) {
        return (
            <div onClick={() => onNavigate('body-lab')} className="cursor-pointer group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 h-full hover:border-sky-500/50 transition-colors">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BrainIcon size={100} className="text-sky-500" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><SparklesIcon size={16} className="text-sky-400"/> BodyLab IA</h3>
                    <p className="text-sm text-slate-400">Genera tu perfil de atleta y descubre tus puntos fuertes y débiles.</p>
                </div>
            </div>
        );
    }
    return (
        <div onClick={() => onNavigate('body-lab')} className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 border border-sky-900/50 p-5 h-full">
             <div className="absolute top-0 right-0 p-3">
                <ChevronRightIcon className="text-sky-500 opacity-50 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] font-bold uppercase text-sky-400 tracking-wider mb-1">Perfil de Atleta</p>
            <h3 className="text-xl font-display text-white mb-3">"{analysis.profileTitle}"</h3>
            
            {analysis.strongPoints.length > 0 && (
                <div className="mt-auto">
                    <div className="flex flex-wrap gap-2">
                         {analysis.strongPoints.slice(0, 2).map((p, i) => (
                             <span key={i} className="text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-1 rounded-md uppercase">{p.muscle}</span>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

interface HomeProps {
  onNavigate: (view: View, program?: Program) => void;
  onResumeWorkout: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onResumeWorkout }) => {
  const { history, skippedLogs, settings, isOnline, ongoingWorkout, bodyLabAnalysis, programs } = useAppState();
  const { handleStartWorkout } = useAppDispatch();

  // Logic to find the next session (simplified for brevity, logic remains same as before)
  const nextSessionInfo = useMemo(() => {
    const todayIndex = new Date().getDay();
    for (const program of programs) {
        for (const macro of program.macrocycles) {
            for (const meso of macro.mesocycles) {
                for (const week of meso.weeks) {
                    const session = week.sessions.find(s => s.dayOfWeek === todayIndex);
                    if (session) return { program, session, weekVariant: week.variant };
                }
            }
        }
    }
    const lastLog = history.length > 0 ? history[history.length - 1] : null;
    if (lastLog) {
        const program = programs.find(p => p.id === lastLog.programId);
        if (program) {
            const allSessions = program.macrocycles.flatMap(m => m.mesocycles.flatMap(me => me.weeks.flatMap(w => w.sessions.map(s => ({ session: s, program, weekVariant: w.variant })))));
            const idx = allSessions.findIndex(item => item.session.id === lastLog.sessionId);
            if (idx > -1 && idx < allSessions.length - 1) return allSessions[idx + 1];
        }
    }
    const firstProgram = programs[0];
    if (firstProgram?.macrocycles[0]?.mesocycles[0]?.weeks[0]?.sessions[0]) {
        return { program: firstProgram, session: firstProgram.macrocycles[0].mesocycles[0].weeks[0].sessions[0], weekVariant: firstProgram.macrocycles[0].mesocycles[0].weeks[0].variant };
    }
    return null;
  }, [programs, history]);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
        
        {/* 1. Status Summary */}
        <AthleteStatusWidget history={history} />

        {/* 2. Resume Workout Alert */}
        {ongoingWorkout && <ResumeWorkoutCard ongoingWorkout={ongoingWorkout} onResume={onResumeWorkout} />}

        {/* 3. Quick Action Center */}
        <QuickActions nextSession={nextSessionInfo} onStart={handleStartWorkout} onNavigate={onNavigate} />

        {/* 4. Weekly KPIs */}
        <WeeklyKPIs history={history} settings={settings} />

        {/* 5. Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <PerformanceScore history={history} skippedLogs={skippedLogs} isOnline={isOnline} settings={settings} />
             <BodyLabWidget analysis={bodyLabAnalysis} onNavigate={onNavigate} />
        </div>
        
        {/* 6. Secondary Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RelativeStrengthCard history={history} settings={settings} />
            <OnThisDayCard />
        </div>

    </div>
  );
};

export default Home;
    