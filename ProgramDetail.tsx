// components/ProgramDetail.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Program, Session, WorkoutLog, Settings, ProgramWeek, Exercise, Macrocycle, Mesocycle } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PlayIcon, PencilIcon, TrashIcon, PlusIcon, ChevronRightIcon, DragHandleIcon, ClipboardListIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { WorkoutVolumeAnalysis } from './WorkoutVolumeAnalysis';
import AIWeekCreator from './AIWeekCreator';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import WeekGoalCoach from './WeekGoalCoach';
import { useAppContext } from '../contexts/AppContext';

interface ProgramDetailProps {
    program: Program;
    history: WorkoutLog[];
    settings: Settings;
    isOnline: boolean;
    onStartWorkout: (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => void;
    onLogWorkout: (programId: string, sessionId: string) => void;
    onEditProgram: (programId: string) => void;
    onEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void;
    onDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
    onAddSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
    onDeleteProgram: (programId: string) => void;
    onUpdateProgram: (program: Program) => void;
}

const isProgramComplex = (p: Program | null): boolean => {
    if (!p) return false;
    if (p.macrocycles.length > 1) return true;
    if (p.macrocycles.length === 1 && p.macrocycles[0].mesocycles.length > 1) return true;
    return false;
};

const SessionCard = React.memo(({ session, weekId, macroIndex, mesoIndex, program, onStartWorkout, onLogWorkout, onEditSession, onDeleteSession, setHistoryModalExercise, handleDragStart, handleDragEnd, weekVariant }: {
    session: Session;
    weekId: string;
    macroIndex: number;
    mesoIndex: number;
    program: Program;
    onStartWorkout: (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => void;
    onLogWorkout: (programId: string, sessionId: string) => void;
    onEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void;
    onDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
    setHistoryModalExercise: (ex: Exercise | null) => void;
    handleDragStart: (e: React.DragEvent, session: Session, weekId: string) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    weekVariant?: ProgramWeek['variant'];
}) => {
    const scoreDiff = useMemo(() => {
        if (!session.lastScore || session.lastScore.previousScore === undefined) return null;
        return session.lastScore.score - session.lastScore.previousScore;
    }, [session.lastScore]);

    return (
        <div key={session.id} draggable onDragStart={(e) => handleDragStart(e, session, weekId)} onDragEnd={handleDragEnd}>
            <div className="bg-slate-800 rounded-lg overflow-hidden group p-3">
                <div className="flex items-start">
                    <DragHandleIcon size={16} className="text-slate-500 cursor-grab flex-shrink-0 mt-1" />
                    <div className="flex-grow px-2">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-slate-200 text-sm">{session.name}</span>
                           {session.lastScore && (
                               <div className="flex items-center gap-1 text-xs font-bold bg-slate-700 px-2 py-0.5 rounded-full">
                                   <span>{session.lastScore.score}/10</span>
                                   {scoreDiff !== null && scoreDiff > 0 && <ArrowUpIcon size={12} className="text-green-400" />}
                                   {scoreDiff !== null && scoreDiff < 0 && <ArrowDownIcon size={12} className="text-red-400" />}
                               </div>
                           )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{session.description}</p>
                        <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-slate-500">Ver ejercicios</summary>
                            <ul className="space-y-0.5 mt-1">
                                {session.exercises.map(ex => (
                                    <li key={ex.id} className="text-slate-300 flex justify-between items-center p-1 hover:bg-slate-700/50 rounded-md">
                                        <span>{ex.sets.length} x {ex.name}</span>
                                        <Button variant="secondary" className="!py-1 !px-2 !text-[10px]" onClick={() => setHistoryModalExercise(ex)}>Historial</Button>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <Button onClick={(e) => { e.stopPropagation(); onStartWorkout(session, program, weekVariant);}} className="!py-1 !px-2 !text-xs flex-1"><PlayIcon size={12}/> Empezar</Button>
                    <Button onClick={(e) => { e.stopPropagation(); onLogWorkout(program.id, session.id);}} variant="secondary" className="!py-1 !px-2 !text-xs flex-1"><ClipboardListIcon size={12}/> Registrar</Button>
                    <Button onClick={() => onEditSession(program.id, macroIndex, mesoIndex, weekId, session.id)} variant="secondary" className="!p-1.5 !text-xs"><PencilIcon size={12}/></Button>
                    <Button onClick={() => onDeleteSession(session.id, program.id, macroIndex, mesoIndex, weekId)} variant="danger" className="!p-1.5 !text-xs"><TrashIcon size={12}/></Button>
                </div>
            </div>
        </div>
    );
});

const CalendarSessionCard = React.memo((props: Omit<Parameters<typeof SessionCard>[0], 'setHistoryModalExercise'>) => {
    const { session, weekId, macroIndex, mesoIndex, program, onStartWorkout, onLogWorkout, onEditSession, onDeleteSession, handleDragStart, handleDragEnd, weekVariant } = props;
    
    return (
        <div draggable onDragStart={(e) => handleDragStart(e, session, weekId)} onDragEnd={handleDragEnd} className="bg-slate-800 rounded-lg p-2 space-y-2 text-xs cursor-grab">
            <p className="font-bold text-white truncate">{session.name}</p>
            <div className="flex gap-1">
                <Button onClick={() => onStartWorkout(session, program, weekVariant)} className="!p-1.5 flex-1"><PlayIcon size={12}/></Button>
                <Button onClick={() => onLogWorkout(program.id, session.id)} variant="secondary" className="!p-1.5"><ClipboardListIcon size={12}/></Button>
                <Button onClick={() => onEditSession(program.id, macroIndex, mesoIndex, weekId, session.id)} variant="secondary" className="!p-1.5"><PencilIcon size={12}/></Button>
                <Button onClick={() => onDeleteSession(session.id, program.id, macroIndex, mesoIndex, weekId)} variant="danger" className="!p-1.5"><TrashIcon size={12}/></Button>
            </div>
        </div>
    );
});

const WeekCalendar = React.memo((props: {
    week: ProgramWeek;
    macroIndex: number;
    mesoIndex: number;
    daysOfWeek: { label: string; value: number; }[];
    dragOverDay: number | 'unassigned' | null;
    setDragOverDay: (day: number | 'unassigned' | null) => void;
    handleDrop: (e: React.DragEvent, week: ProgramWeek, targetDayIndex: number | undefined, macroIndex: number, mesoIndex: number) => void;
    draggedSessionInfo: { weekId: string; sessionId: string; } | null;
    program: Program;
    onStartWorkout: (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => void;
    onLogWorkout: (programId: string, sessionId: string) => void;
    onEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void;
    onDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
    handleDragStart: (e: React.DragEvent, session: Session, weekId: string) => void;
    handleDragEnd: (e: React.DragEvent) => void;
}) => {
    const { week, macroIndex, mesoIndex, daysOfWeek, dragOverDay, setDragOverDay, handleDrop, ...sessionCardProps } = props;

    const assignedSessions = week.sessions.filter(s => s.dayOfWeek !== undefined && s.dayOfWeek !== null);
    const unassignedSessions = week.sessions.filter(s => s.dayOfWeek === undefined || s.dayOfWeek === null);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Headers */}
                {daysOfWeek.map(day => <div key={day.value} className="text-center text-xs font-bold text-slate-400 mb-1">{day.label.substring(0, 3)}</div>)}

                {/* Cells */}
                {daysOfWeek.map(day => {
                    const sessionsForDay = assignedSessions.filter(s => s.dayOfWeek === day.value);
                    return (
                        <div
                            key={day.value}
                            onDragOver={e => { e.preventDefault(); setDragOverDay(day.value); }}
                            onDragLeave={() => setDragOverDay(null)}
                            onDrop={e => handleDrop(e, week, day.value, macroIndex, mesoIndex)}
                            className={`p-1 rounded-lg transition-colors min-h-[80px] space-y-2 ${dragOverDay === day.value ? 'bg-primary-color/20' : 'bg-slate-900/50'}`}
                        >
                            {sessionsForDay.map(session => (
                                <CalendarSessionCard key={session.id} session={session} weekId={week.id} macroIndex={macroIndex} mesoIndex={mesoIndex} weekVariant={week.variant} {...sessionCardProps} />
                            ))}
                        </div>
                    );
                })}
            </div>

            {unassignedSessions.length > 0 && (
                <details className="group bg-slate-900 rounded-lg overflow-hidden transition" open>
                    <summary className="p-3 cursor-pointer flex justify-between items-center list-none bg-slate-800/50 group-open:border-b group-open:border-slate-700/50">
                        <h4 className="font-semibold text-lg text-white">Sesiones sin Asignar</h4>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{unassignedSessions.length}</span>
                    </summary>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverDay('unassigned'); }}
                        onDragLeave={() => setDragOverDay(null)}
                        onDrop={(e) => handleDrop(e, week, undefined, macroIndex, mesoIndex)}
                        className={`p-3 grid grid-cols-2 md:grid-cols-3 gap-2 transition-colors min-h-[50px] ${dragOverDay === 'unassigned' ? 'bg-primary-color/20' : ''}`}
                    >
                        {unassignedSessions.map(session => (
                             <CalendarSessionCard key={session.id} session={session} weekId={week.id} macroIndex={macroIndex} mesoIndex={mesoIndex} weekVariant={week.variant} {...sessionCardProps} />
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
});


const WeekSchedule = React.memo((props: {
    week: ProgramWeek;
    macroIndex: number;
    mesoIndex: number;
    dayOfWeekScores: Record<number, number>;
    getScoreColorStyle: (score: number | undefined) => React.CSSProperties;
    daysOfWeek: { label: string; value: number; }[];
    dragOverDay: number | 'unassigned' | null;
    setDragOverDay: (day: number | 'unassigned' | null) => void;
    handleDrop: (e: React.DragEvent, week: ProgramWeek, targetDayIndex: number | undefined, macroIndex: number, mesoIndex: number) => void;
    draggedSessionInfo: { weekId: string; sessionId: string; } | null;
    program: Program;
    onStartWorkout: (session: Session, program: Program, weekVariant?: ProgramWeek['variant']) => void;
    onLogWorkout: (programId: string, sessionId: string) => void;
    onEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void;
    onDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
    setHistoryModalExercise: (ex: Exercise | null) => void;
    handleDragStart: (e: React.DragEvent, session: Session, weekId: string) => void;
    handleDragEnd: (e: React.DragEvent) => void;
}) => {
    const { week, macroIndex, mesoIndex, dayOfWeekScores, getScoreColorStyle, daysOfWeek, dragOverDay, setDragOverDay, handleDrop, ...sessionCardProps } = props;

    const assignedSessions = week.sessions.filter(s => s.dayOfWeek !== undefined && s.dayOfWeek !== null);
    const unassignedSessions = week.sessions.filter(s => s.dayOfWeek === undefined || s.dayOfWeek === null);
    
    const todayRaw = new Date().getDay();
    
    return (
        <div className="space-y-3">
            {daysOfWeek.map(day => {
                const sessionsForDay = assignedSessions.filter(s => s.dayOfWeek === day.value);
                const isToday = todayRaw === day.value;
                const isOpenByDefault = sessionsForDay.length > 0 || isToday;
                const dayScore = dayOfWeekScores[day.value];
                const scoreStyle = getScoreColorStyle(dayScore);

                return (
                    <details key={day.value} className="group bg-slate-900 rounded-lg overflow-hidden transition" open={isOpenByDefault}>
                        <summary 
                            className="day-summary p-3 cursor-pointer flex justify-between items-center list-none group-open:border-b group-open:border-slate-700/50"
                            style={scoreStyle}
                        >
                            <div className="flex items-center gap-3">
                                <ChevronRightIcon className="details-arrow transition-transform text-slate-400" size={20}/>
                                <h4 className={`font-semibold text-lg ${isToday ? 'text-[var(--primary-color-400)]' : 'text-white'}`}>{day.label}</h4>
                            </div>
                            {sessionsForDay.length > 0 && (
                                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{sessionsForDay.length} {sessionsForDay.length > 1 ? 'sesiones' : 'sesión'}</span>
                            )}
                        </summary>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOverDay(day.value); }}
                            onDragLeave={() => setDragOverDay(null)}
                            onDrop={(e) => handleDrop(e, week, day.value, macroIndex, mesoIndex)}
                            className={`p-3 space-y-2 transition-colors min-h-[50px] ${dragOverDay === day.value ? 'bg-[var(--primary-color-950)]' : ''}`}
                        >
                            {sessionsForDay.map(session => (
                                <SessionCard key={session.id} session={session} weekId={week.id} macroIndex={macroIndex} mesoIndex={mesoIndex} weekVariant={week.variant} {...sessionCardProps} />
                            ))}
                            {sessionsForDay.length === 0 && <p className="text-center text-xs text-slate-500 py-2">Arrastra una sesión aquí o crea una nueva.</p>}
                        </div>
                    </details>
                );
            })}

            <details className="group bg-slate-900 rounded-lg overflow-hidden transition" open={unassignedSessions.length > 0}>
                <summary className="p-3 cursor-pointer flex justify-between items-center list-none bg-slate-800/50 group-open:border-b group-open:border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <ChevronRightIcon className="details-arrow transition-transform text-slate-400" size={20}/>
                        <h4 className="font-semibold text-lg text-white">Sesiones sin Asignar</h4>
                    </div>
                    {unassignedSessions.length > 0 && (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{unassignedSessions.length}</span>
                    )}
                </summary>
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOverDay('unassigned'); }}
                    onDragLeave={() => setDragOverDay(null)}
                    onDrop={(e) => handleDrop(e, week, undefined, macroIndex, mesoIndex)}
                    className={`p-3 space-y-2 transition-colors min-h-[50px] ${dragOverDay === 'unassigned' ? 'bg-[var(--primary-color-950)]' : ''}`}
                >
                    {unassignedSessions.map(session => (
                         <SessionCard key={session.id} session={session} weekId={week.id} macroIndex={macroIndex} mesoIndex={mesoIndex} weekVariant={week.variant} {...sessionCardProps} />
                    ))}
                     {unassignedSessions.length === 0 && <p className="text-center text-xs text-slate-500 py-2">Todas las sesiones están asignadas.</p>}
                </div>
            </details>
        </div>
    );
});


const ProgramDetail: React.FC<ProgramDetailProps> = (props) => {
    const { program, history, settings, isOnline, onStartWorkout, onLogWorkout, onEditProgram, onEditSession, onDeleteSession, onAddSession, onDeleteProgram, onUpdateProgram } = props;
    const { setCurrentBackgroundOverride } = useAppContext();
    const [isAiWeekCreatorOpen, setIsAiWeekCreatorOpen] = useState(false);
    const [historyModalExercise, setHistoryModalExercise] = useState<Exercise | null>(null);
    const [draggedSessionInfo, setDraggedSessionInfo] = useState<{ weekId: string, sessionId: string } | null>(null);
    const [dragOverDay, setDragOverDay] = useState<number | 'unassigned' | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    
    const isComplex = isProgramComplex(program);

    useEffect(() => {
        const bg = program.background || (program.coverImage ? { type: 'image', value: program.coverImage, style: { blur: 8, brightness: 0.6 } } : undefined);
        setCurrentBackgroundOverride(bg);
        return () => setCurrentBackgroundOverride(undefined);
    }, [program, setCurrentBackgroundOverride]);

    const dayOfWeekScores = useMemo(() => {
        const programHistory = history.filter(log => log.programId === program.id);
        if (programHistory.length === 0) return {};

        const scoresByDay: { [day: number]: number[] } = {};

        programHistory.forEach(log => {
            const dayOfWeek = new Date(log.date).getDay();
            if (scoresByDay[dayOfWeek] === undefined) scoresByDay[dayOfWeek] = [];
            
            let sessionScores: number[] = [];
            if (log.fatigueLevel) sessionScores.push((10 - log.fatigueLevel) / 9);
            if (log.mentalClarity) sessionScores.push((log.mentalClarity - 1) / 9);

            const jointLoads = log.completedExercises.map(e => e.jointLoad).filter(Boolean) as number[];
            const techQualities = log.completedExercises.map(e => e.technicalQuality).filter(Boolean) as number[];

            if (jointLoads.length > 0) {
                const avg = jointLoads.reduce((a, b) => a + b, 0) / jointLoads.length;
                sessionScores.push((10 - avg) / 9);
            }
            if (techQualities.length > 0) {
                const avg = techQualities.reduce((a, b) => a + b, 0) / techQualities.length;
                sessionScores.push((avg - 1) / 9);
            }

            if (sessionScores.length > 0) {
                const avgSessionScore = sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length;
                scoresByDay[dayOfWeek].push(avgSessionScore);
            }
        });
        
        const finalScores: { [day: number]: number } = {};
        Object.keys(scoresByDay).forEach(dayStr => {
            const day = parseInt(dayStr, 10);
            const scores = scoresByDay[day];
            if (scores.length > 0) {
                finalScores[day] = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
        });

        return finalScores;
    }, [history, program.id]);

    const getScoreColorStyle = (score: number | undefined): React.CSSProperties => {
        if (score === undefined || isNaN(score)) return {};
        const hue = score * 120;
        return { '--day-hue': hue } as React.CSSProperties;
    };


    const handleSaveWeek = (newWeek: ProgramWeek) => {
        const updatedProgram = JSON.parse(JSON.stringify(program));
        const lastMacro = updatedProgram.macrocycles[updatedProgram.macrocycles.length - 1];
        if (lastMacro) {
            const lastMeso = lastMacro.mesocycles[lastMacro.mesocycles.length - 1];
            if (lastMeso) {
                lastMeso.weeks.push(newWeek);
                onUpdateProgram(updatedProgram);
            }
        }
        setIsAiWeekCreatorOpen(false);
    };
    
    const handleDragStart = (e: React.DragEvent, session: Session, weekId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', session.id);
        setDraggedSessionInfo({ sessionId: session.id, weekId });
        (e.currentTarget as HTMLElement).classList.add('opacity-30');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('opacity-30');
        setDraggedSessionInfo(null);
        setDragOverDay(null);
    };

    const handleDrop = (e: React.DragEvent, week: ProgramWeek, targetDayIndex: number | undefined, macroIndex: number, mesoIndex: number) => {
        e.preventDefault();
        setDragOverDay(null);
        if (!draggedSessionInfo || draggedSessionInfo.weekId !== week.id) return;

        const updatedProgram = JSON.parse(JSON.stringify(program));
        const targetWeek = updatedProgram.macrocycles[macroIndex].mesocycles[mesoIndex].weeks.find((w: ProgramWeek) => w.id === week.id);
        if (!targetWeek) return;

        const draggedSession = targetWeek.sessions.find((s: Session) => s.id === draggedSessionInfo.sessionId);
        if (!draggedSession) return;

        const sessionAtTarget = targetWeek.sessions.find((s: Session) => s.dayOfWeek === targetDayIndex);

        if (sessionAtTarget && sessionAtTarget.id !== draggedSession.id) {
            sessionAtTarget.dayOfWeek = draggedSession.dayOfWeek;
            draggedSession.dayOfWeek = targetDayIndex;
        } else {
            draggedSession.dayOfWeek = targetDayIndex;
        }

        onUpdateProgram(updatedProgram);
    };

    const daysOfWeek = useMemo(() => settings.startWeekOn === 'lunes'
    ? [{label: 'Lunes', value: 1}, {label: 'Martes', value: 2}, {label: 'Miércoles', value: 3}, {label: 'Jueves', value: 4}, {label: 'Viernes', value: 5}, {label: 'Sábado', value: 6}, {label: 'Domingo', value: 0}]
    : [{label: 'Domingo', value: 0}, {label: 'Lunes', value: 1}, {label: 'Martes', value: 2}, {label: 'Miércoles', value: 3}, {label: 'Jueves', value: 4}, {label: 'Viernes', value: 5}, {label: 'Sábado', value: 6}], [settings.startWeekOn]);

    const renderComplexProgramContent = () => (
        <div className="space-y-4">
            {program.macrocycles.map((macro, macroIndex) => (
                <details key={macro.id} className="group glass-card overflow-hidden !p-0 border-l-4 border-slate-600" open>
                    <summary className="p-4 cursor-pointer flex justify-between items-center list-none bg-slate-900/50 group-open:border-b group-open:border-slate-700/50">
                        <div className="flex items-center gap-4"><ChevronRightIcon className="details-arrow" /><h3 className="font-bold text-xl text-white">{macro.name}</h3></div>
                    </summary>
                    <div className="p-4 space-y-3">
                        {macro.mesocycles.map((meso, mesoIndex) => (
                            <details key={meso.id} className="group bg-slate-900 rounded-lg overflow-hidden !p-0 border-l-4 border-slate-700" open>
                                <summary className="p-3 cursor-pointer flex justify-between items-center list-none bg-slate-800/50 group-open:border-b group-open:border-slate-700/50">
                                    <div className="flex items-center gap-3"><ChevronRightIcon className="details-arrow" size={20}/><h4 className="font-semibold text-lg">{meso.name}</h4></div>
                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{meso.goal}</span>
                                </summary>
                                <div className="p-3 space-y-4">
                                    <WeekGoalCoach goal={meso.goal} />
                                    {meso.weeks.map((week) => (
                                        <details key={week.id} className="bg-slate-950/50 rounded-lg overflow-hidden transition" open>
                                            <summary className="p-3 cursor-pointer flex justify-between items-center list-none group-open:border-b group-open:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <ChevronRightIcon className="details-arrow transition-transform text-slate-400" size={20}/>
                                                    <h5 className="text-md font-bold text-white">{week.name}</h5>
                                                    {week.variant && <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary-color/20 text-primary-color">Semana {week.variant}</span>}
                                                </div>
                                                <Button onClick={(e) => { e.preventDefault(); onAddSession(program.id, macroIndex, mesoIndex, week.id); }} variant="secondary" className="!text-xs !py-1"><PlusIcon size={14}/> Sesión</Button>
                                            </summary>
                                            <div className="p-3">
                                                {viewMode === 'list' ? 
                                                    <WeekSchedule 
                                                        week={week} macroIndex={macroIndex} mesoIndex={mesoIndex} dayOfWeekScores={dayOfWeekScores}
                                                        getScoreColorStyle={getScoreColorStyle} daysOfWeek={daysOfWeek} dragOverDay={dragOverDay}
                                                        setDragOverDay={setDragOverDay} handleDrop={handleDrop} draggedSessionInfo={draggedSessionInfo}
                                                        program={program} onStartWorkout={onStartWorkout} onLogWorkout={onLogWorkout} onEditSession={onEditSession}
                                                        onDeleteSession={onDeleteSession} setHistoryModalExercise={setHistoryModalExercise}
                                                        handleDragStart={handleDragStart} handleDragEnd={handleDragEnd}
                                                    /> :
                                                    <WeekCalendar
                                                        week={week} macroIndex={macroIndex} mesoIndex={mesoIndex} daysOfWeek={daysOfWeek} dragOverDay={dragOverDay}
                                                        setDragOverDay={setDragOverDay} handleDrop={handleDrop} draggedSessionInfo={draggedSessionInfo}
                                                        program={program} onStartWorkout={onStartWorkout} onLogWorkout={onLogWorkout} onEditSession={onEditSession}
                                                        onDeleteSession={onDeleteSession}
                                                        handleDragStart={handleDragStart} handleDragEnd={handleDragEnd}
                                                    />
                                                }
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                </details>
            ))}
        </div>
    );

    const renderSimpleProgramContent = () => {
        const macroIndex = 0;
        const mesoIndex = 0;
        const mesocycle = program.macrocycles[0]?.mesocycles[0];
        if (!mesocycle) return <Card>Este programa no tiene semanas. Edítalo para añadir contenido.</Card>;

        return (
             <div className="space-y-4">
                {mesocycle.weeks.map((week) => (
                    <details key={week.id} className="bg-slate-950/50 rounded-lg overflow-hidden transition" open>
                        <summary className="p-3 cursor-pointer flex justify-between items-center list-none group-open:border-b group-open:border-slate-800">
                            <div className="flex items-center gap-3">
                                <ChevronRightIcon className="details-arrow transition-transform text-slate-400" size={20}/>
                                <h5 className="text-md font-bold text-white">{week.name}</h5>
                                {week.variant && <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary-color/20 text-primary-color">Semana {week.variant}</span>}
                            </div>
                            <Button onClick={(e) => { e.preventDefault(); onAddSession(program.id, macroIndex, mesoIndex, week.id); }} variant="secondary" className="!text-xs !py-1"><PlusIcon size={14}/> Sesión</Button>
                        </summary>
                        <div className="p-3">
                             {viewMode === 'list' ?
                                <WeekSchedule
                                    week={week} macroIndex={macroIndex} mesoIndex={mesoIndex} dayOfWeekScores={dayOfWeekScores}
                                    getScoreColorStyle={getScoreColorStyle} daysOfWeek={daysOfWeek} dragOverDay={dragOverDay}
                                    setDragOverDay={setDragOverDay} handleDrop={handleDrop} draggedSessionInfo={draggedSessionInfo}
                                    program={program} onStartWorkout={onStartWorkout} onLogWorkout={onLogWorkout} onEditSession={onEditSession}
                                    onDeleteSession={onDeleteSession} setHistoryModalExercise={setHistoryModalExercise}
                                    handleDragStart={handleDragStart} handleDragEnd={handleDragEnd}
                                /> :
                                <WeekCalendar
                                    week={week} macroIndex={macroIndex} mesoIndex={mesoIndex} daysOfWeek={daysOfWeek} dragOverDay={dragOverDay}
                                    setDragOverDay={setDragOverDay} handleDrop={handleDrop} draggedSessionInfo={draggedSessionInfo}
                                    program={program} onStartWorkout={onStartWorkout} onLogWorkout={onLogWorkout} onEditSession={onEditSession}
                                    onDeleteSession={onDeleteSession}
                                    handleDragStart={handleDragStart} handleDragEnd={handleDragEnd}
                                />
                             }
                        </div>
                    </details>
                ))}
            </div>
        )
    };


    return (
        <div className="space-y-8 animate-fade-in pb-28">
            {isAiWeekCreatorOpen && (
                <AIWeekCreator
                    isOpen={isAiWeekCreatorOpen}
                    onClose={() => setIsAiWeekCreatorOpen(false)}
                    onSave={handleSaveWeek}
                    program={program}
                    isOnline={isOnline}
                />
            )}
             {historyModalExercise && (
                <ExerciseHistoryModal
                    exercise={historyModalExercise}
                    programId={program.id}
                    history={history}
                    settings={settings}
                    onClose={() => setHistoryModalExercise(null)}
                />
            )}
            
            <header 
                className="relative aspect-video w-full rounded-3xl overflow-hidden glass-card p-0 md:h-64"
                style={{ viewTransitionName: `program-card-${program.id}` } as React.CSSProperties}
            >
                {(() => {
                    const bg = program.background;
                    const imageSrc = (bg && bg.type === 'image') ? bg.value : program.coverImage;
                    // Provide a default style if only coverImage exists, otherwise use the stored style or no style.
                    const style = (bg && bg.type === 'image' && bg.style) 
                        ? bg.style 
                        : { blur: 0, brightness: 1.0 }; 

                    if (!imageSrc) {
                        return <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>;
                    }

                    return (
                        <>
                            <img
                                src={imageSrc}
                                alt={program.name}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                                style={{
                                    // Scale up slightly based on blur radius to hide faded edges
                                    transform: `scale(${1 + ((style.blur ?? 0) / 150)})`,
                                    filter: `blur(${style.blur ?? 0}px)`
                                }}
                            />
                            {/* Brightness/Darkness overlay */}
                            <div
                                className="absolute inset-0 bg-black transition-opacity duration-300"
                                style={{
                                    opacity: 1 - (style.brightness ?? 1.0)
                                }}
                            />
                        </>
                    );
                })()}

                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

                <div className="relative p-6 flex flex-col justify-end h-full">
                    <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>{program.name}</h1>
                    <p className="text-slate-300 mt-2 max-w-2xl" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)'}}>{program.description}</p>
                </div>
            </header>

            <div className="flex flex-wrap gap-4 items-center">
                 <Button onClick={() => onEditProgram(program.id)}><PencilIcon size={16}/> Editar Programa</Button>
                <Button onClick={() => onDeleteProgram(program.id)} variant="danger"><TrashIcon size={16}/> Eliminar Programa</Button>
                <div className="flex bg-slate-800 p-1 rounded-full ml-auto">
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded-full transition-colors ${viewMode === 'list' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Lista</button>
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm rounded-full transition-colors ${viewMode === 'calendar' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Calendario</button>
                </div>
            </div>

            <WorkoutVolumeAnalysis program={program} history={history} settings={settings} isOnline={isOnline} />
            
            {isComplex ? renderComplexProgramContent() : renderSimpleProgramContent() }

        </div>
    );
};

export default React.memo(ProgramDetail);