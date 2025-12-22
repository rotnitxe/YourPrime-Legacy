// components/Home.tsx
import React, { useMemo, useState } from 'react';
import { Program, Session, WorkoutLog, Settings, BodyProgressLog, NutritionLog, SkippedWorkoutLog, View, OngoingWorkoutState, BodyLabAnalysis, ProgramWeek, SessionBackground } from '../types';
import PerformanceScore from './PerformanceScore';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlayIcon, FlameIcon, TrophyIcon, ClockIcon, BarChartIcon, BookOpenIcon, PlusIcon, ChevronRightIcon, PauseIcon, BrainIcon, SparklesIcon, TrendingUpIcon, XCircleIcon } from './icons';
import { formatLargeNumber, getWeekId, calculateStreak, calculateBrzycki1RM } from '../utils/calculations';
import OnThisDayCard from './OnThisDayCard';
import RelativeStrengthCard from './RelativeStrengthCard';
import { useAppState, useAppDispatch } from '../contexts/AppContext';

const CardBackground: React.FC<{ background?: SessionBackground }> = ({ background }) => {
    if (!background) return null;

    const bgStyle: React.CSSProperties = {
        backgroundImage: background.type === 'image' ? `url(${background.value})` : undefined,
        backgroundColor: background.type === 'color' ? background.value : undefined,
        filter: background.type === 'image' ? `blur(${background.style?.blur ?? 4}px) brightness(${background.style?.brightness ?? 0.6})` : undefined,
    };

    return (
        <>
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300 z-0"
                style={bgStyle}
            />
            <div className="absolute inset-0 bg-black/60 z-0" />
        </>
    );
};


interface NextSessionInfo {
    program: Program;
    session: Session;
    weekVariant?: ProgramWeek['variant'];
}

const NextSessionCard: React.FC<{
    sessionInfo: NextSessionInfo | null;
    onStart: (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => void;
    onSkip: (session: Session, program: Program, reason: SkippedWorkoutLog['reason'], notes?: string) => void;
    onNavigate: (view: View, program?: Program) => void;
}> = ({ sessionInfo, onStart, onSkip, onNavigate }) => {
    const { programs } = useAppState();
    const effectiveBackground = sessionInfo?.session.background || sessionInfo?.program.background;

    const handleSkip = (reason: SkippedWorkoutLog['reason']) => {
        if (!sessionInfo) return;
        if (reason === 'other') {
            const notes = prompt("Por favor, introduce una breve razón para saltar el entrenamiento:");
            if (notes) {
                onSkip(sessionInfo.session, sessionInfo.program, reason, notes);
            }
        } else {
            onSkip(sessionInfo.session, sessionInfo.program, reason);
        }
    };

    return (
        <Card className="next-session-glow">
            {sessionInfo ? (
                <>
                    <h3 className="text-xl font-bold text-white mb-4">Próxima Sesión</h3>
                    <div className="glass-card-nested p-4 rounded-xl relative overflow-hidden">
                        <CardBackground background={effectiveBackground} />
                        <div className="relative z-10">
                            <p className="text-xs font-semibold text-primary-color">{sessionInfo.program.name}</p>
                            <h4 className="text-2xl font-bold text-white">{sessionInfo.session.name}</h4>
                            <p className="text-sm text-slate-400">{sessionInfo.session.exercises.length} ejercicios</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <Button onClick={() => onStart(sessionInfo.session, sessionInfo.program, sessionInfo.weekVariant)} className="w-full !py-3 !text-base">
                            <PlayIcon /> Empezar Entrenamiento
                        </Button>
                    </div>
                     <div className="mt-4 pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-center text-slate-500 mb-2">¿No puedes entrenar hoy?</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <button onClick={() => handleSkip('sick')} className="py-2 px-1 bg-slate-800/50 rounded-lg hover:bg-slate-700">🤒 Enfermo/a</button>
                            <button onClick={() => handleSkip('vacation')} className="py-2 px-1 bg-slate-800/50 rounded-lg hover:bg-slate-700">✈️ Vacaciones</button>
                            <button onClick={() => handleSkip('gym_closed')} className="py-2 px-1 bg-slate-800/50 rounded-lg hover:bg-slate-700">❌ Gym Cerrado</button>
                            <button onClick={() => handleSkip('other')} className="py-2 px-1 bg-slate-800/50 rounded-lg hover:bg-slate-700">🤔 Otro...</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-4">
                    <p className="text-slate-300 font-semibold text-lg">¡Día de descanso!</p>
                    <p className="text-sm text-slate-400 mt-1">O planea tu próxima semana.</p>
                </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><BookOpenIcon /> Mis Programas</h3>
                    <Button onClick={() => onNavigate('program-editor')} variant="secondary" className="!text-xs !py-1">
                        <PlusIcon size={14}/> Nuevo
                    </Button>
                </div>
                {programs.length > 0 ? (
                    <div className="space-y-2">
                        {programs.slice(0, 3).map(program => (
                            <div key={program.id} onClick={() => onNavigate('program-detail', program)} className="glass-card-nested p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors relative overflow-hidden rounded-lg">
                                <CardBackground background={program.background} />
                                <div className="relative z-10 w-full flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-200">{program.name}</p>
                                        <p className="text-xs text-slate-400">{program.description}</p>
                                    </div>
                                    <ChevronRightIcon className="text-slate-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400">
                        <p className="text-sm">Aún no tienes programas.</p>
                        <Button onClick={() => onNavigate('program-editor')} className="mt-3">Crear mi primer programa</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const WeeklySummary: React.FC = () => {
    const { history, settings } = useAppState();
    const summary = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(getWeekId(now, settings.startWeekOn).split('-').join('/'));

        const thisWeekLogs = history.filter(log => new Date(log.date) >= weekStart);

        const totalSessions = thisWeekLogs.length;
        const totalDuration = thisWeekLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
        const totalVolume = thisWeekLogs.reduce((acc, log) => {
            return acc + log.completedExercises.reduce((exAcc, ex) => {
                return exAcc + ex.sets.reduce((setAcc, set) => {
                    return setAcc + (set.weight || 0) * (set.completedReps || set.completedDuration || 0);
                }, 0);
            }, 0);
        }, 0);

        return {
            totalSessions,
            totalDuration: Math.round(totalDuration / 60), 
            totalVolume: totalVolume,
        };
    }, [history, settings.startWeekOn]);

    const { streak } = useMemo(() => calculateStreak(history, settings), [history, settings]);

    const streakColor = streak > 0 ? 'text-orange-400' : 'text-slate-400';
    const streakPulse = streak > 0 ? 'animate-pulse' : '';

    return (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
                <BarChartIcon size={24} className="icon"/>
                <p className="value">{summary.totalSessions}</p>
                <p className="label">Sesiones (Semana)</p>
            </div>
            <div className="stat-card">
                <TrophyIcon size={24} className="icon"/>
                <p className="value">{formatLargeNumber(summary.totalVolume)}</p>
                <p className="label">Volumen ({settings.weightUnit})</p>
            </div>
            <div className="stat-card">
                <ClockIcon size={24} className="icon"/>
                <p className="value">{summary.totalDuration}</p>
                <p className="label">Minutos</p>
            </div>
            <div className="stat-card">
                <FlameIcon size={24} className={`icon transition-colors ${streakColor} ${streakPulse}`}/>
                <p className={`value transition-colors ${streakColor}`}>{streak}</p>
                <p className="label">Racha Semanal</p>
            </div>
        </div>
    )
};

const ResumeWorkoutCard: React.FC<{ ongoingWorkout: OngoingWorkoutState, onResume: () => void }> = ({ ongoingWorkout, onResume }) => {
    return (
        <Card className="!bg-primary-gradient animate-pulse-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><PauseIcon /> Entrenamiento en Pausa</h3>
                    <p className="text-white/80">{ongoingWorkout.session.name}</p>
                </div>
                <Button onClick={onResume} variant="secondary" className="!bg-white !text-primary-color w-full sm:w-auto">
                    <PlayIcon size={16}/> Reanudar
                </Button>
            </div>
        </Card>
    );
};

const BodyLabWidget: React.FC<{ analysis: BodyLabAnalysis | null, onNavigate: (view: View) => void }> = ({ analysis, onNavigate }) => {
    if (!analysis) {
        return (
            <Card className="bg-gradient-to-br from-sky-900/50 to-slate-900/50 border-sky-600/50 h-full flex flex-col justify-center">
                <div className="text-center">
                    <BrainIcon className="mx-auto text-sky-300" size={48} />
                    <h3 className="text-xl font-bold text-white mt-3">Descubre tu Perfil de Atleta</h3>
                    <p className="text-sm text-slate-300 mt-1">Usa la IA de BodyLab para entender tus fortalezas y debilidades.</p>
                    <Button onClick={() => onNavigate('body-lab')} className="mt-4">
                        <SparklesIcon /> Analizar
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card onClick={() => onNavigate('body-lab')} className="cursor-pointer bg-gradient-to-br from-sky-900/30 to-slate-900/30 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <BrainIcon className="text-sky-300 flex-shrink-0" size={40} />
                <div className="flex-1">
                    <p className="text-xs font-semibold text-sky-400">TU PERFIL DE ATLETA</p>
                    <h3 className="text-lg font-bold text-white truncate">"{analysis.profileTitle}"</h3>
                </div>
                <ChevronRightIcon className="text-slate-500" />
            </div>
            {analysis.strongPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sky-800/50 flex-grow flex flex-col justify-end">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><TrendingUpIcon size={14}/> PUNTOS FUERTES</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.strongPoints.slice(0, 3).map(point => (
                            <span key={point.muscle} className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{point.muscle}</span>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};


interface HomeProps {
  onNavigate: (view: View, program?: Program) => void;
  onResumeWorkout: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onResumeWorkout }) => {
  const { history, skippedLogs, settings, isOnline, ongoingWorkout, bodyLabAnalysis, programs } = useAppState();
  const { handleStartWorkout, handleSkipWorkout } = useAppDispatch();

  const nextSessionInfo = useMemo<NextSessionInfo | null>(() => {
    const todayIndex = new Date().getDay(); // 0 = Sunday

    for (const program of programs) {
        for (const macro of program.macrocycles) {
            for (const meso of macro.mesocycles) {
                for (const week of meso.weeks) {
                    const session = week.sessions.find(s => s.dayOfWeek === todayIndex);
                    if (session) {
                        return { program, session, weekVariant: week.variant };
                    }
                }
            }
        }
    }

    const lastLog = history.length > 0 ? history[history.length - 1] : null;
    if (lastLog) {
        const program = programs.find(p => p.id === lastLog.programId);
        if (program) {
            const allSessionsWithContext = program.macrocycles.flatMap(macro =>
                macro.mesocycles.flatMap(meso =>
                    meso.weeks.flatMap(week =>
                        week.sessions.map(session => ({ session, program, weekVariant: week.variant }))
                    )
                )
            );
            const lastLogIndex = allSessionsWithContext.findIndex(item => item.session.id === lastLog.sessionId);
            if (lastLogIndex > -1 && lastLogIndex < allSessionsWithContext.length - 1) {
                const nextSessionData = allSessionsWithContext[lastLogIndex + 1];
                return { program: nextSessionData.program, session: nextSessionData.session, weekVariant: nextSessionData.weekVariant };
            }
        }
    }

    const firstProgram = programs[0];
    if (firstProgram) {
        const firstSession = firstProgram.macrocycles[0]?.mesocycles[0]?.weeks[0]?.sessions[0];
        if (firstSession) {
            return { program: firstProgram, session: firstSession, weekVariant: firstProgram.macrocycles[0].mesocycles[0].weeks[0].variant };
        }
    }

    return null;
  }, [programs, history]);

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-slate-900 via-transparent to-transparent -z-10" />

      <div className="animate-fade-in space-y-8">
          {ongoingWorkout && (
              <div className="animate-fade-in-up" style={{ animationDelay: '-50ms' }}>
                   <ResumeWorkoutCard ongoingWorkout={ongoingWorkout} onResume={onResumeWorkout} />
              </div>
          )}

          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <NextSessionCard 
                  sessionInfo={nextSessionInfo}
                  onStart={handleStartWorkout}
                  onSkip={handleSkipWorkout}
                  onNavigate={onNavigate}
              />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <WeeklySummary />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '75ms' }}>
            <OnThisDayCard />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-bold text-white mb-3">Tu Panel de Análisis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PerformanceScore history={history} skippedLogs={skippedLogs} isOnline={isOnline} settings={settings} />
                <BodyLabWidget analysis={bodyLabAnalysis} onNavigate={onNavigate} />
                <RelativeStrengthCard history={history} settings={settings} />
              </div>
          </div>
          
      </div>
    </div>
  );
};

export default Home;
