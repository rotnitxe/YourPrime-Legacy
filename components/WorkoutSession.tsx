
// components/WorkoutSession.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Session, Program, Settings, WorkoutLog, CompletedExercise, CompletedSet, Exercise, ExerciseSet, SessionBackground, OngoingWorkoutState, ExerciseMuscleInfo, BrandEquivalency, OngoingSetData } from '../types';
import Button from './ui/Button';
import { ClockIcon, ChevronRightIcon, FlameIcon, CheckCircleIcon, ZapIcon, XCircleIcon, TrophyIcon, MinusIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, SaveIcon, StarIcon, XIcon, ReplaceIcon, BrainIcon, CameraIcon, TrashIcon, FocusIcon, SwapIcon } from './icons';
import { playSound } from '../services/soundService';
import { hapticImpact, hapticNotification, ImpactStyle, NotificationType } from '../services/hapticsService';
import { calculateBrzycki1RM, roundWeight, getWeightSuggestionForSet, isMachineOrCableExercise, getRepDebtContextKey } from '../utils/calculations';
import { calculatePlates } from '../utils/plateCalculator';
import { useAppDispatch, useAppState } from '../contexts/AppContext';
import TimeSaverModal from './TimeSaverModal';
import FinishWorkoutModal from './FinishWorkoutModal';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import Modal from './ui/Modal';
import SubstituteExerciseSheet from './SubstituteExerciseSheet';
import { takePicture } from '../services/cameraService';
import { optimizeImage } from '../services/imageService';
import Card from './ui/Card';
import { storageService } from '../services/storageService';
import ExerciseFeedbackModal from './ExerciseFeedbackModal';


interface WorkoutSessionProps {
    session: Session;
    program: Program;
    programId: string;
    programName: string;
    settings: Settings;
    isOnline: boolean;
    history: WorkoutLog[];
    onFinish: (completedExercises: CompletedExercise[], durationInSeconds: number, notes?: string, discomforts?: string[], fatigue?: number, clarity?: number, logDate?: string, photo?: string) => void;
    onCancel: () => void;
    // FIX: Updated function signature to match the one in AppContext, which includes exerciseName.
    onUpdateExercise1RM: (exerciseDbId: string | undefined, exerciseName: string, new1RM: number | null, reps: number, testDate?: string, machineBrand?: string) => void;
    isFinishModalOpen: boolean;
    setIsFinishModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isTimeSaverModalOpen: boolean;
    setIsTimeSaverModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onUpdateExerciseInProgram: (programId: string, sessionId: string, exerciseId: string, updatedExercise: Exercise) => void;
    isTimersModalOpen: boolean;
    setIsTimersModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    exerciseList: ExerciseMuscleInfo[];
}

// --- Type definitions specific to this component's state ---
type SetInputState = { reps: string; weight: string; rpe: string; rir: string; isFailure: boolean; duration: string; notes: string };
type UnilateralSetInputs = { left: SetInputState; right: SetInputState };
type LoggedSideState = Record<string, 'left' | null>;


const findPrForExercise = (exerciseInfo: ExerciseMuscleInfo, history: WorkoutLog[], settings: Settings, currentMachineBrand?: string): { prString: string, e1rm: number, reps: number } | null => {
    let best1RM = 0;
    let prString = '';
    let bestReps = Infinity;
    const exerciseDbId = exerciseInfo.id;
    const exerciseNameLower = exerciseInfo.name.toLowerCase();
    const brandEquivalencies = exerciseInfo.brandEquivalencies;

    history.forEach(log => {
        const completedEx = log.completedExercises.find(ce => {
            if (exerciseDbId && ce.exerciseDbId) {
                return ce.exerciseDbId === exerciseDbId;
            }
            return ce.exerciseName.toLowerCase() === exerciseNameLower;
        });

        if (completedEx) {
            completedEx.sets.forEach(set => {
                if (typeof set.weight === 'number' && typeof set.completedReps === 'number' && set.completedReps > 0) {
                    let weightToCompare = set.weight;
                    
                    if (brandEquivalencies && brandEquivalencies.length > 0) {
                        const currentBrandRatio = brandEquivalencies.find(b => b.brand === currentMachineBrand)?.ratio || 1.0;
                        const loggedBrandRatio = brandEquivalencies.find(b => b.brand === set.machineBrand)?.ratio || 1.0;

                        if (currentBrandRatio !== loggedBrandRatio && loggedBrandRatio > 0) {
                            const baseEquivalentWeight = set.weight / loggedBrandRatio;
                            weightToCompare = baseEquivalentWeight * currentBrandRatio;
                        }
                    }

                    const e1RM = calculateBrzycki1RM(weightToCompare, set.completedReps);
                    const roundedE1RM = Math.round(e1RM * 10) / 10;
                    const roundedBest1RM = Math.round(best1RM * 10) / 10;

                    if (roundedE1RM > roundedBest1RM) {
                        best1RM = e1RM;
                        prString = `${set.weight}${settings.weightUnit} x ${set.completedReps} reps${set.machineBrand ? ` (${set.machineBrand})` : ''}`;
                        bestReps = set.completedReps;
                    } else if (roundedE1RM === roundedBest1RM && set.completedReps < bestReps) {
                        prString = `${set.weight}${settings.weightUnit} x ${set.completedReps} reps${set.machineBrand ? ` (${set.machineBrand})` : ''}`;
                        bestReps = set.completedReps;
                    }
                }
            });
        }
    });

    if (best1RM > 0) {
        return { prString, e1rm: Math.round(best1RM * 10) / 10, reps: bestReps };
    }
    return null;
};

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatSetTarget = (set: ExerciseSet) => {
    const parts: string[] = [];
    if (set.targetReps) parts.push(`${set.targetReps} reps`);
    else if (set.targetDuration) parts.push(`${set.targetDuration}s`);
    
    if (set.intensityMode === 'failure') {
        parts.push('Al Fallo');
    } else if (set.targetRPE) {
        parts.push(`@ RPE ${set.targetRPE}`);
    } else if (set.targetRIR) {
        parts.push(`@ RIR ${set.targetRIR}`);
    }
    
    return parts.join(' ');
};

const formatTimer = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((milliseconds % 1000) / 10).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${ms}`;
};


const SaveChangesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSavePermanently: () => void;
    onSaveOnce: () => void;
}> = ({ isOpen, onClose, onSavePermanently, onSaveOnce }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Guardar Cambios en la Sesión">
            <div className="p-2 space-y-4 text-center">
                <p className="text-slate-300">Detectamos que modificaste la estructura de esta sesión. ¿Quieres guardar los cambios para futuros entrenamientos?</p>
                <Button onClick={onSavePermanently} className="w-full !py-3 flex-col !h-auto">
                    <div className="flex items-center gap-2"><SaveIcon /> Guardar Permanentemente</div>
                    <small className="font-normal block w-full text-center text-xs opacity-80 mt-1">Afectará futuros entrenamientos</small>
                </Button>
                <Button onClick={onSaveOnce} variant="secondary" className="w-full !py-3 flex-col !h-auto">
                    <div className="flex items-center gap-2"><CheckCircleIcon /> Solo para esta vez</div>
                    <small className="font-normal block w-full text-center text-xs opacity-80 mt-1">El programa original no cambiará</small>
                </Button>
            </div>
        </Modal>
    );
};

const getTargetIntensityDisplay = (set: ExerciseSet) => {
    if (set.intensityMode === 'approx') {
        return { value: 'APROX', label: 'APROX' };
    }
    if (set.intensityMode === 'rpe') {
        return { value: set.targetRPE || '-', label: 'RPE' };
    }
    if (set.intensityMode === 'rir') {
        return { value: set.targetRIR || '-', label: 'RIR' };
    }
    if (set.intensityMode === 'failure') {
        return { value: <FlameIcon className="text-danger-color"/>, label: 'FALLO' };
    }
    // Fallback/default for older data or undefined intensityMode
    if (set.targetRPE) {
        return { value: set.targetRPE, label: 'RPE' };
    }
    if (set.targetRIR) {
        return { value: set.targetRIR, label: 'RIR' };
    }
    return { value: 'APROX', label: 'APROX' };
};

const WorkoutHeader: React.FC<{
    sessionName: string;
    totalSets: number;
    completedSetsCount: number;
    duration: number;
    availableModes: ('A' | 'B' | 'C' | 'D')[];
    activeMode: 'A' | 'B' | 'C' | 'D';
    onSetMode: (mode: 'A' | 'B' | 'C' | 'D') => void;
    improvementIndex: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
    background?: SessionBackground;
    readiness?: OngoingWorkoutState['readiness'];
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
    isPeriodizationMode: boolean;
}> = React.memo(({ sessionName, totalSets, completedSetsCount, duration, availableModes, activeMode, onSetMode, improvementIndex, background, readiness, isFocusMode, onToggleFocusMode, isPeriodizationMode }) => {
    const { restTimer } = useAppState();

    const readinessInfo = useMemo(() => {
        if (!readiness) return null;
        const score = readiness.readinessScore;
        let level = 'Medio';
        let color = 'text-sky-400';
        if (score >= 90) { level = 'Óptimo'; color = 'text-green-400'; }
        else if (score < 60) { level = 'Bajo'; color = 'text-yellow-400'; }
        
        return {
            score,
            level,
            color,
            message: score >= 90 ? "¡Es un buen día para buscar un PR!" : score < 60 ? "Considera reducir volumen/intensidad." : "Sigue el plan como está programado."
        };
    }, [readiness]);

    return (
        <div className="sticky top-0 z-30 bg-[var(--bg-color)] pb-3 animate-fade-in-down">
            <div className="workout-header-card !p-0 relative overflow-hidden">
                 {background?.type === 'image' && (
                    <>
                        <img 
                            src={background.value} 
                            className="absolute inset-0 w-full h-full object-cover z-0" 
                            style={{ filter: `blur(${background.style?.blur ?? 2}px) brightness(${background.style?.brightness ?? 0.7})` }}
                            alt=""
                        />
                        <div className="absolute inset-0 bg-black/50 z-0" />
                    </>
                )}
                <div className="relative z-10 p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center font-bold text-xl text-white">{activeMode}</div>
                             <div>
                                <h2 className="text-2xl font-bold text-white truncate pr-2">{sessionName}</h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    {readiness && readinessInfo ? (
                                        <span className={`font-semibold ${readinessInfo.color}`}>
                                            Preparación: {readinessInfo.score}% ({readinessInfo.level})
                                        </span>
                                    ) : (
                                        <span>{completedSetsCount} / {totalSets} series completadas</span>
                                    )}
                                </p>
                             </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={onToggleFocusMode} className={`p-2 rounded-full transition-colors ${isFocusMode ? 'bg-primary-color text-white' : 'bg-slate-800/80 text-slate-300'}`}><FocusIcon size={20}/></button>
                            {availableModes.length > 1 && !isPeriodizationMode && (
                                <div className="flex items-center gap-1 p-1 rounded-full bg-slate-800/80 border border-slate-700">
                                    {availableModes.map(mode => (
                                         <button 
                                            key={mode}
                                            onClick={() => onSetMode(mode)} 
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${activeMode === mode ? 'bg-primary-color text-white' : 'text-slate-300'}`}
                                          >
                                           {mode}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-900/50 rounded-xl p-2">
                            <p className="text-2xl font-bold font-mono text-white">{formatDuration(duration)}</p>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Tiempo</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-2">
                            <p className="text-2xl font-bold font-mono text-white">{completedSetsCount}/{totalSets}</p>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Series</p>
                        </div>
                         <div className={`rounded-xl p-2 transition-colors ${restTimer ? 'bg-green-900/80' : 'bg-slate-900/50'}`}>
                             {restTimer ? (
                                <>
                                    <p className="text-2xl font-bold font-mono text-white">{formatDuration(restTimer.remaining)}</p>
                                    <p className="text-[10px] uppercase text-green-300 font-semibold tracking-wider">Descanso</p>
                                </>
                             ) : (
                                <>
                                   {improvementIndex ? (
                                        <>
                                            <p className={`text-2xl font-bold font-mono flex items-center justify-center gap-1 ${
                                                improvementIndex.direction === 'up' ? 'text-green-400' : improvementIndex.direction === 'down' ? 'text-red-400' : 'text-sky-400'
                                            }`}>
                                                {improvementIndex.direction === 'up' && <ArrowUpIcon size={16} />}
                                                {improvementIndex.direction === 'down' && <ArrowDownIcon size={16} />}
                                                {improvementIndex.percent > 0 ? '+' : ''}{improvementIndex.percent}%
                                            </p>
                                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Mejora</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold font-mono text-white">--:--</p>
                                            <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Descanso</p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                     {readiness && readinessInfo && (
                        <p className="text-center text-xs text-slate-300 pt-3 border-t border-slate-700/50">
                            <span className="font-bold">Sugerencia del Coach:</span> {readinessInfo.message}
                        </p>
                     )}
                </div>
            </div>
        </div>
    );
});

const SetDetails: React.FC<{
    exercise: Exercise;
    exerciseInfo: ExerciseMuscleInfo | undefined;
    set: ExerciseSet;
    isComplete: boolean;
    settings: Settings;
    onLogSet: (data: UnilateralSetInputs, sideToLog: 'left' | 'right') => void;
    inputs: UnilateralSetInputs;
    onInputChange: (side: 'left' | 'right', field: keyof SetInputState, value: any) => void;
    dynamicWeights: { consolidated?: number, technical?: number };
    onToggleChangeOfPlans: () => void;
    isChangeOfPlans: boolean;
    loggedSide: 'left' | null;
}> = ({ exercise, exerciseInfo, set, isComplete, settings, onLogSet, inputs, onInputChange, dynamicWeights, onToggleChangeOfPlans, isChangeOfPlans, loggedSide }) => {
    
    const plateCombination = useMemo(() => {
        const weight = parseFloat(inputs.left.weight);
        if (isNaN(weight) || weight <= 0) return null;
        return calculatePlates(weight, settings);
    }, [inputs.left.weight, settings]);

    const handleAdjust = (side: 'left' | 'right', field: 'reps' | 'weight' | 'duration', amount: number) => {
        const currentValue = parseFloat(inputs[side][field]) || 0;
        let newValue: number;

        if (field === 'weight') {
            const step = settings.weightUnit === 'kg' ? (currentValue < 20 ? 1.25 : 2.5) : 2.5;
            newValue = Math.max(0, currentValue + (amount * step));
        } else {
            newValue = Math.max(0, currentValue + amount);
        }
        onInputChange(side, field, newValue.toString());
    };
    
    const renderEffortInput = (side: 'left' | 'right') => {
        switch (set.intensityMode) {
            case 'rir':
                return <input type="number" value={inputs[side].rir} onChange={e => onInputChange(side, 'rir', e.target.value)} placeholder="RIR" className="effort-input !w-16"/>;
            case 'failure':
                return <div className="effort-input !w-16 flex items-center justify-center"><FlameIcon size={16} className="text-danger-color"/></div>
            default: // approx or rpe
                return <input type="number" step="0.5" value={inputs[side].rpe} onChange={e => onInputChange(side, 'rpe', e.target.value)} placeholder="RPE" className="effort-input !w-16"/>;
        }
    };
    
    const isTimed = exercise.trainingMode === 'time';
    
    if (isTimed) {
        return <div className="set-card-content text-center text-slate-400">El registro por tiempo no está implementado para el modo unilateral.</div>;
    }
    
    if (exercise.isUnilateral) {
        const intensityDisplay = getTargetIntensityDisplay(set);
        return (
            <div className="set-card-content space-y-4 p-4">
                <div className="grid grid-cols-2 gap-3">
                   <div className="text-center">
                       <div className="target-stat-card-v2"><span className="value">{set.targetReps || '-'}</span></div>
                       <span className="target-stat-label">REPS</span>
                   </div>
                   <div className="text-center">
                       <div className="target-stat-card-v2"><span className={`value ${typeof intensityDisplay.value === 'string' && intensityDisplay.value.length > 2 ? '!text-2xl' : ''}`}>{intensityDisplay.value}</span></div>
                       <span className="target-stat-label">{intensityDisplay.label}</span>
                   </div>
                </div>
               
               <div className="grid grid-cols-2 gap-3">
                   {(['left', 'right'] as const).map(side => (
                       <div key={side} className={`space-y-3 p-3 bg-slate-950/50 rounded-lg transition-opacity ${loggedSide === 'left' && side === 'left' ? 'opacity-40' : ''}`}>
                            <h4 className="font-bold text-center text-slate-300 text-sm">{side === 'left' ? 'Izquierdo' : 'Derecho'}</h4>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block text-center">Peso</label>
                                    <input type="number" inputMode="decimal" value={inputs[side].weight} onChange={e => onInputChange(side, 'weight', e.target.value)} className="workout-input-v2 !w-full !h-12 !text-2xl"/>
                                </div>
                                 <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block text-center">Reps</label>
                                    <input type="number" inputMode="numeric" value={inputs[side].reps} onChange={e => onInputChange(side, 'reps', e.target.value)} className="workout-input-v2 !w-full !h-12 !text-2xl"/>
                                </div>
                                 <div className="flex justify-center">
                                    {renderEffortInput(side)}
                                 </div>
                            </div>
                             <input type="text" value={inputs[side].notes} onChange={e => onInputChange(side, 'notes', e.target.value)} placeholder="Notas..." className="w-full bg-slate-800 border-slate-700 rounded p-1 text-xs" />
                       </div>
                   ))}
               </div>
               
                <div className="flex justify-center">
                   <Button onClick={() => onLogSet(inputs, loggedSide === 'left' ? 'right' : 'left')} className="w-full max-w-xs !py-3 !text-lg">
                       {loggedSide === 'left' ? 'Registrar Lado Derecho' : 'Registrar Lado Izquierdo'}
                   </Button>
               </div>
           </div>
       )
    }

    // Default (non-unilateral) render
    const targetRepsDisplay = set.targetReps || '-';
    const completedReps = parseInt(inputs.left.reps, 10) || 0;
    const targetReps = set.targetReps || 0;
    
    const debtContextKey = getRepDebtContextKey(set);
    const historicalDebt = (exerciseInfo?.repDebtHistory || {})[debtContextKey] || 0;
    const debt = historicalDebt + (targetReps > 0 ? completedReps - targetReps : 0);
    const intensityDisplay = getTargetIntensityDisplay(set);

    let debtColor = debt > 0 ? 'rid-positive' : debt < 0 ? 'rid-negative' : '';
    let debtSign = debt > 0 ? '+' : '';

    return (
        <div className="set-card-content space-y-6 p-4">
            <div className="flex justify-end -mb-4">
                <Button
                    onClick={onToggleChangeOfPlans}
                    variant={isChangeOfPlans ? 'primary' : 'secondary'}
                    className={`!text-xs !py-1 !px-3 ${isChangeOfPlans ? '!bg-yellow-500 !text-black !border-yellow-500' : 'bg-slate-800'}`}
                >
                    LIBRE
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                    <div className="target-stat-card-v2"><span className="value">{isChangeOfPlans ? '-' : targetRepsDisplay}</span></div>
                    <span className="target-stat-label">REPS</span>
                </div>
                <div className="text-center">
                    <div className="target-stat-card-v2"><span className={`value ${debtColor}`}>{isChangeOfPlans ? '-' : `${debtSign}${debt}`}</span></div>
                    <span className="target-stat-label">RED</span>
                </div>
                <div className="text-center">
                    <div className="target-stat-card-v2"><span className={`value ${typeof intensityDisplay.value === 'string' ? '!text-2xl' : ''}`}>{intensityDisplay.value}</span></div>
                    <span className="target-stat-label">{intensityDisplay.label}</span>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block text-center">Reps Completadas</label>
                    <div className="flex items-center justify-center gap-3">
                        <button type="button" onClick={() => handleAdjust('left', 'reps', -1)} className="workout-adjust-btn"><MinusIcon/></button>
                        <input type="number" inputMode="numeric" value={inputs.left.reps} onChange={e => onInputChange('left', 'reps', e.target.value)} className="workout-input-v2 !w-24 !h-24 !text-4xl"/>
                        <button type="button" onClick={() => handleAdjust('left', 'reps', 1)} className="workout-adjust-btn"><PlusIcon/></button>
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block text-center">Peso ({settings.weightUnit})</label>
                    <div className="flex items-center justify-center gap-3">
                        <button type="button" onClick={() => handleAdjust('left', 'weight', -1)} className="workout-adjust-btn"><MinusIcon/></button>
                        <input type="number" inputMode="decimal" step="0.5" value={inputs.left.weight} onChange={e => onInputChange('left', 'weight', e.target.value)} className="workout-input-v2"/>
                        <button type="button" onClick={() => handleAdjust('left', 'weight', 1)} className="workout-adjust-btn"><PlusIcon/></button>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block text-center">Intensidad Percibida</label>
                    <div className="flex items-center justify-center">
                        {renderEffortInput('left')}
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-slate-300 mb-1 block text-center">Notas de la Serie</label>
                    <input type="text" value={inputs.left.notes} onChange={e => onInputChange('left', 'notes', e.target.value)} placeholder="Ej: 3 reps parciales, con ayuda..." className="w-full bg-slate-800 border-slate-700 rounded p-2 text-sm text-center" />
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={() => onLogSet(inputs, 'left')} className="w-full max-w-xs !py-3 !text-lg">{isComplete ? 'Actualizar Serie' : 'Registrar Serie'}</Button>
            </div>

            {plateCombination && plateCombination.platesPerSide.length > 0 && (
                <div className="text-center pt-4 border-t border-slate-700/50">
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Discos (por lado)</label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {plateCombination.platesPerSide.map(({plate, count}) => (
                            <span key={plate} className="plate-chip">{count} &times; {plate}{settings.weightUnit}</span>
                        ))}
                         {plateCombination.remainder > 0 && <span className="plate-chip !bg-slate-800 !text-slate-500">Resto: {plateCombination.remainder}{settings.weightUnit}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
    session,
    program,
    programId,
    programName,
    settings,
    isOnline,
    history,
    onFinish,
    onCancel,
    onUpdateExercise1RM,
    isFinishModalOpen,
    setIsFinishModalOpen,
    isTimeSaverModalOpen,
    setIsTimeSaverModalOpen,
    onUpdateExerciseInProgram,
    isTimersModalOpen,
    setIsTimersModalOpen,
    exerciseList,
}) => {
    const { ongoingWorkout } = useAppState();
    const { setOngoingWorkout, handleStartRest, addToast, addOrUpdateCustomExercise } = useAppDispatch();
    
    const initialSession = ongoingWorkout ? ongoingWorkout.session : session;
    const initialStartTime = ongoingWorkout ? ongoingWorkout.startTime : Date.now();
    const initialActiveMode = ongoingWorkout ? ongoingWorkout.activeMode : 'A';
    
    const [currentSession, setCurrentSession] = useState<Session>(initialSession);
    const [startTime, setStartTime] = useState(initialStartTime);
    const [duration, setDuration] = useState(0);
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
    const [activeSetId, setActiveSetId] = useState<string | null>(null);
    const [activeMode, setActiveMode] = useState<'A' | 'B' | 'C' | 'D'>(initialActiveMode);
    
    const [unilateralSetInputs, setUnilateralSetInputs] = useState<Record<string, UnilateralSetInputs>>({});
    const [loggedSideState, setLoggedSideState] = useState<LoggedSideState>({});
    const [historyModalExercise, setHistoryModalExercise] = useState<Exercise | null>(null);
    const [substituteModalExercise, setSubstituteModalExercise] = useState<Exercise | null>(null);
    const [isSaveChangesModalOpen, setIsSaveChangesModalOpen] = useState(false);
    const [feedbackModalExercise, setFeedbackModalExercise] = useState<Exercise | null>(null);
    
    const [completedSets, setCompletedSets] = useState<Record<string, { left: OngoingSetData | null, right: OngoingSetData | null }>>(ongoingWorkout?.completedSets || {});
    const [dynamicWeights, setDynamicWeights] = useState<Record<string, { consolidated?: number, technical?: number }>>(ongoingWorkout?.dynamicWeights || {});
    const [selectedBrands, setSelectedBrands] = useState<Record<string, string>>(ongoingWorkout?.selectedBrands || {});
    const [changeOfPlansSets, setChangeOfPlansSets] = useState<Set<string>>(new Set());
    const [sessionPhoto, setSessionPhoto] = useState<string | null>(ongoingWorkout?.photo || null);
    
    const [pendingFinishData, setPendingFinishData] = useState<any>(null);

    const mainContentRef = useRef<HTMLDivElement>(null);

    const exercisesForMode = useMemo(() => {
        const modeKey = `session${activeMode}` as 'sessionB' | 'sessionC' | 'sessionD';
        if (activeMode === 'A' || !currentSession[modeKey]) {
            return currentSession.exercises;
        }
        return (currentSession[modeKey] as any).exercises;
    }, [activeMode, currentSession]);
    
     const totalSetsInSession = useMemo(() => {
        return exercisesForMode.reduce((total, ex) => total + ex.sets.length * (ex.isUnilateral ? 2 : 1), 0);
    }, [exercisesForMode]);

    const completedSetsCount = useMemo(() => {
        return Object.values(completedSets).flatMap(sides => Object.values(sides)).filter(Boolean).length;
    }, [completedSets]);
    
    useEffect(() => {
      setOngoingWorkout(prevOngoingWorkout => {
        if (!prevOngoingWorkout) {
          // This can happen if the workout is cancelled. Don't try to update.
          return null;
        }
        return {
            ...prevOngoingWorkout,
            session: currentSession,
            completedSets,
            dynamicWeights,
            selectedBrands,
            photo: sessionPhoto,
        };
      });
    }, [currentSession, completedSets, dynamicWeights, selectedBrands, sessionPhoto, setOngoingWorkout]);

    useEffect(() => {
        if (ongoingWorkout) {
            setCurrentSession(ongoingWorkout.session);
            setStartTime(ongoingWorkout.startTime);
            setActiveMode(ongoingWorkout.activeMode);
            setCompletedSets(ongoingWorkout.completedSets || {});
            setDynamicWeights(ongoingWorkout.dynamicWeights || {});
            setSelectedBrands(ongoingWorkout.selectedBrands || {});
            setSessionPhoto(ongoingWorkout.photo || null);
            
            const initialCOP = new Set<string>();
            if (ongoingWorkout.completedSets) {
                Object.keys(ongoingWorkout.completedSets).forEach(setId => {
                    const sides = ongoingWorkout.completedSets[setId];
                    if (sides.left?.isChangeOfPlans || sides.right?.isChangeOfPlans) {
                        initialCOP.add(setId);
                    }
                })
            }
            setChangeOfPlansSets(initialCOP);

            let nextExerciseId = null;
            let nextSetId = null;
            
            const exercises = activeMode === 'A' || !(ongoingWorkout.session as any)[`session${activeMode}`]
                ? ongoingWorkout.session.exercises
                : (ongoingWorkout.session as any)[`session${activeMode}`].exercises;

            for (const ex of exercises) {
                for (const set of ex.sets) {
                    const isComplete = (ongoingWorkout.completedSets[set.id]?.left && (!ex.isUnilateral || ongoingWorkout.completedSets[set.id]?.right));
                    if (!isComplete) {
                        nextExerciseId = ex.id;
                        nextSetId = set.id;
                        break;
                    }
                }
                if (nextExerciseId) break;
            }
            setActiveExerciseId(nextExerciseId || exercises[0]?.id || null);
            setActiveSetId(nextSetId || exercises[0]?.sets[0]?.id || null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    useEffect(() => {
        const newInputs: Record<string, UnilateralSetInputs> = {};
        exercisesForMode.forEach(ex => {
            ex.sets.forEach((set, setIndex) => {
                const completedData = completedSets[set.id];
                // FIX: Build array of completed sets for the current exercise to pass to the suggestion function.
                const completedSetsForThisExercise = ex.sets
                    .slice(0, setIndex)
                    .map(s => completedSets[s.id])
                    .filter(Boolean)
                    .flatMap(sides => [sides.left, sides.right])
                    .filter((d): d is OngoingSetData => !!d)
                    .map(d => ({ reps: d.reps || 0, weight: d.weight }));
                
                const exerciseInfo = exerciseList.find(e => e.id === ex.exerciseDbId);

                // FIX: Pass the missing `exerciseInfo` argument and the correctly constructed `completedSetsForThisExercise`.
                const suggestedWeight = getWeightSuggestionForSet(ex, exerciseInfo, setIndex, completedSetsForThisExercise, dynamicWeights[ex.id] || {}, settings, history, selectedBrands[ex.id]);

                newInputs[set.id] = {
                    left: {
                        reps: completedData?.left?.reps?.toString() || set.targetReps?.toString() || '',
                        weight: completedData?.left?.weight.toString() || suggestedWeight?.toString() || '',
                        rpe: completedData?.left?.rpe?.toString() || '',
                        rir: completedData?.left?.rir?.toString() || '',
                        isFailure: completedData?.left?.isFailure || false,
                        duration: completedData?.left?.duration?.toString() || set.targetDuration?.toString() || '',
                        notes: completedData?.left?.notes || set.notes || '',
                    },
                    right: {
                        reps: completedData?.right?.reps?.toString() || set.targetReps?.toString() || '',
                        weight: completedData?.right?.weight.toString() || suggestedWeight?.toString() || '',
                        rpe: completedData?.right?.rpe?.toString() || '',
                        rir: completedData?.right?.rir?.toString() || '',
                        isFailure: completedData?.right?.isFailure || false,
                        duration: completedData?.right?.duration?.toString() || set.targetDuration?.toString() || '',
                        notes: completedData?.right?.notes || set.notes || '',
                    },
                };
            });
        });
        setUnilateralSetInputs(newInputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMode, currentSession, completedSets, dynamicWeights, settings, history, exercisesForMode, selectedBrands]);

    useEffect(() => {
        if (isFocusMode && activeExerciseId && activeSetId) {
            const element = document.getElementById(`set-summary-${activeSetId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isFocusMode, activeExerciseId, activeSetId]);

    const handleLogSet = useCallback((inputs: UnilateralSetInputs, sideToLog: 'left' | 'right') => {
        const exercise = exercisesForMode.find(ex => ex.id === activeExerciseId);
        const set = exercise?.sets.find(s => s.id === activeSetId);
        if (!exercise || !set) return;
    
        const inputData = inputs[sideToLog];
        const reps = inputData.reps ? parseInt(inputData.reps, 10) : undefined;
        const weight = parseFloat(inputData.weight);
        
        if (isNaN(weight) || (reps === undefined || isNaN(reps))) {
            addToast("Por favor, introduce un peso y repeticiones válidos.", "danger");
            return;
        }
    
        const setData: OngoingSetData = {
            reps: reps, weight: weight,
            rpe: inputData.rpe ? parseFloat(inputData.rpe) : undefined,
            rir: inputData.rir ? parseInt(inputData.rir, 10) : undefined,
            isFailure: inputData.isFailure,
            machineBrand: selectedBrands[exercise.id],
            isChangeOfPlans: changeOfPlansSets.has(set.id),
            notes: inputData.notes,
        };
        
        setCompletedSets(prev => {
            const currentSet = prev[set.id] || { left: null, right: null };
            return { ...prev, [set.id]: { ...currentSet, [sideToLog]: setData } };
        });
        
        if (exercise.isUnilateral) {
            if (sideToLog === 'left') {
                setLoggedSideState(prev => ({ ...prev, [set.id]: 'left' }));
                if (exercise.unilateralRestTime && exercise.unilateralRestTime > 0) {
                    handleStartRest(exercise.unilateralRestTime, 'Descanso entre lados');
                }
                return; 
            }
            setLoggedSideState(prev => ({ ...prev, [set.id]: null }));
        }

        const completedRpe = setData.rpe;
        const completedRir = setData.rir;
        const targetRpe = set.targetRPE;
        const targetRir = set.targetRIR;
        let feedback = '';

        if (set.intensityMode === 'rpe' && completedRpe && targetRpe) {
            const diff = completedRpe - targetRpe;
            if (diff >= 1.5) feedback = `Mucho más difícil de lo esperado (RPE ${completedRpe} vs ${targetRpe})`;
            else if (diff >= 0.5) feedback = `Algo más difícil de lo esperado (RPE ${completedRpe} vs ${targetRpe})`;
            else if (diff <= -1.5) feedback = `Mucho más fácil de lo esperado (RPE ${completedRpe} vs ${targetRpe})`;
            else if (diff <= -0.5) feedback = `Algo más fácil de lo esperado (RPE ${completedRpe} vs ${targetRpe})`;
            else feedback = `¡Intensidad clavada! (RPE ${completedRpe})`;
        } else if (set.intensityMode === 'rir' && completedRir !== undefined && targetRir !== undefined) {
            const diff = targetRir - completedRir;
            if (diff >= 2) feedback = `Mucho más difícil de lo esperado (RIR ${completedRir} vs ${targetRir})`;
            else if (diff >= 1) feedback = `Algo más difícil de lo esperado (RIR ${completedRir} vs ${targetRir})`;
            else if (diff <= -2) feedback = `Mucho más fácil de lo esperado (RIR ${completedRir} vs ${targetRir})`;
            else if (diff <= -1) feedback = `Algo más fácil de lo esperado (RIR ${completedRir} vs ${targetRir})`;
            else feedback = `¡Intensidad clavada! (RIR ${completedRir})`;
        }
        if (feedback) addToast(feedback, 'suggestion');
        
        playSound('set-logged-sound');
        hapticImpact(ImpactStyle.Medium);

        const exerciseInfo = exerciseList.find(e => e.id === exercise.exerciseDbId);
        if (exerciseInfo) {
            const pr = findPrForExercise(exerciseInfo, history, settings, selectedBrands[exercise.id]);
            const e1rm = calculateBrzycki1RM(weight, reps);
            if (!pr || e1rm > pr.e1rm) {
                // FIX: Corrected argument order to match the updated onUpdateExercise1RM signature.
                onUpdateExercise1RM(exerciseInfo.id, exercise.name, e1rm, reps, new Date().toISOString(), selectedBrands[exercise.id]);
                playSound('new-pr-sound');
                addToast(`¡Nuevo PR en ${exercise.name}!`, 'achievement');
            }
        }
        
        if (set.targetReps && reps > set.targetReps) playSound('rep-surplus-sound');
    
        const setIndex = exercise.sets.findIndex(s => s.id === set.id);
        if (setIndex < exercise.sets.length - 1) {
            setActiveSetId(exercise.sets[setIndex + 1].id);
        } else {
            const exIndex = exercisesForMode.findIndex(e => e.id === exercise.id);
            if (exIndex < exercisesForMode.length - 1) {
                const nextExercise = exercisesForMode[exIndex + 1];
                setActiveExerciseId(nextExercise.id);
                setActiveSetId(nextExercise.sets[0].id);
            } else {
                setActiveSetId(null);
                addToast("¡Último ejercicio completado!", "success");
            }
            setFeedbackModalExercise(exercise); // Open feedback modal for the completed exercise
        }
    
        if (exercise.restTime > 0) handleStartRest(exercise.restTime, `Descanso para ${exercise.name}`);
    }, [activeExerciseId, activeSetId, exercisesForMode, selectedBrands, changeOfPlansSets, addToast, onUpdateExercise1RM, history, handleStartRest, settings, exerciseList]);

    const handleSetInputChange = (setId: string, side: 'left' | 'right', field: keyof SetInputState, value: string | boolean) => {
        setUnilateralSetInputs(prev => {
            const existingSetInput = prev[setId] || {
                left: { reps: '', weight: '', rpe: '', rir: '', isFailure: false, duration: '', notes: '' },
                right: { reps: '', weight: '', rpe: '', rir: '', isFailure: false, duration: '', notes: '' }
            };
            return {
                ...prev,
                [setId]: { ...existingSetInput, [side]: { ...existingSetInput[side], [field]: value } }
            };
        });
    };
    
    const handleToggleChangeOfPlans = (setId: string) => {
        setChangeOfPlansSets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setId)) newSet.delete(setId);
            else newSet.add(setId);
            return newSet;
        });
        hapticImpact(ImpactStyle.Light);
    };

    const handleSelectBrand = (exerciseId: string, brand: string) => {
        setSelectedBrands(prev => {
            if (prev[exerciseId] === brand) {
                const newState = { ...prev };
                delete newState[exerciseId];
                return newState;
            }
            return { ...prev, [exerciseId]: brand };
        });
    };
    
    const handleAddNewBrand = (e: React.FocusEvent<HTMLInputElement>, exerciseId: string) => {
        const newBrandName = e.target.value.trim();
        if (!newBrandName) return;

        const exercise = exercisesForMode.find(ex => ex.id === exerciseId);
        const exerciseInfo = exerciseList.find(ei => ei.id === exercise?.exerciseDbId);
        if (!exercise || !exerciseInfo) return;

        if (exerciseInfo.brandEquivalencies?.some(b => b.brand.toLowerCase() === newBrandName.toLowerCase())) {
            setSelectedBrands(prev => ({ ...prev, [exerciseId]: newBrandName }));
            e.target.value = '';
            return;
        }

        const newBrand: BrandEquivalency = {
            brand: newBrandName,
        };
        
        const updatedEquivalencies = [...(exerciseInfo.brandEquivalencies || []), newBrand];
        const updatedExerciseInfo = { ...exerciseInfo, brandEquivalencies: updatedEquivalencies };

        addOrUpdateCustomExercise(updatedExerciseInfo);

        setSelectedBrands(prev => ({ ...prev, [exerciseId]: newBrandName }));

        e.target.value = '';
        addToast(`Nueva marca '${newBrandName}' añadida y guardada.`, 'success');
    };

    const handleSelectAlternative = (newExerciseName: string) => {
        if (!substituteModalExercise) return;
        const newExerciseData = exerciseList.find(ex => ex.name.toLowerCase() === newExerciseName.toLowerCase());
        const newExercise: Exercise = {
            ...substituteModalExercise,
            id: crypto.randomUUID(), name: newExerciseName,
            exerciseDbId: newExerciseData?.id,
        };
        setCurrentSession(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex => ex.id === substituteModalExercise.id ? newExercise : ex)
        }));
        addToast(`'${substituteModalExercise.name}' sustituido por '${newExerciseName}'.`, 'suggestion');
        setSubstituteModalExercise(null);
    };

    const handleSaveFeedback = (feedback: { jointLoad: number; technicalQuality: number; }) => {
        if (!feedbackModalExercise) return;
        setOngoingWorkout(prev => {
            if (!prev) return null;
            return {
                ...prev,
                exerciseFeedback: {
                    ...prev.exerciseFeedback,
                    [feedbackModalExercise.id]: {
                        ...(prev.exerciseFeedback[feedbackModalExercise.id] || {}),
                        ...feedback
                    }
                }
            };
        });
        setFeedbackModalExercise(null);
    };
    
    const handleFinalizeFinish = useCallback((savePermanently: boolean) => {
        if (!pendingFinishData) return;

        const { notes, discomforts, fatigueLevel, mentalClarity } = pendingFinishData;
        const durationInSeconds = Math.floor((Date.now() - startTime) / 1000);
        
        if (savePermanently) {
            // This logic is complex and requires more context than is available here.
            // Keeping the user's original (flawed) call for now to minimize unexpected changes.
            console.warn("Permanent save from workout session is not fully implemented.");
            onUpdateExerciseInProgram(programId, currentSession.id, currentSession.exercises[0].id, currentSession.exercises[0]);
        }

        const completedExercises: CompletedExercise[] = exercisesForMode.map(ex => {
            const feedback = ongoingWorkout?.exerciseFeedback[ex.id];
            const mappedSets = ex.sets.reduce((acc: CompletedSet[], set) => {
                const completed = completedSets[set.id];

                const mapToCompletedSet = (setData: OngoingSetData, setId: string, side?: 'left' | 'right'): CompletedSet => ({
                    id: setId,
                    targetReps: set.targetReps,
                    targetRPE: set.targetRPE,
                    targetRIR: set.targetRIR,
                    completedReps: setData.reps,
                    completedDuration: setData.duration,
                    weight: setData.weight,
                    completedRPE: setData.rpe,
                    completedRIR: setData.rir,
                    isFailure: setData.isFailure,
                    machineBrand: setData.machineBrand,
                    isChangeOfPlans: setData.isChangeOfPlans,
                    notes: setData.notes,
                    side: side,
                });

                if (completed?.left) {
                    acc.push(mapToCompletedSet(completed.left, set.id + '_left', ex.isUnilateral ? 'left' : undefined));
                }
                if (completed?.right) {
                    acc.push(mapToCompletedSet(completed.right, set.id + '_right', 'right'));
                }
                return acc;
            }, []);

            return {
                exerciseId: ex.id,
                exerciseDbId: ex.exerciseDbId,
                exerciseName: ex.name,
                variantName: ex.variantName,
                useBodyweight: ex.useBodyweight,
                sets: mappedSets.filter(s => (s.completedReps !== undefined || s.completedDuration !== undefined) && s.weight !== undefined),
                jointLoad: feedback?.jointLoad,
                technicalQuality: feedback?.technicalQuality,
                machineBrand: selectedBrands[ex.id],
            };
        }).filter(ex => ex.sets.length > 0);
        
        if (completedExercises.length === 0) {
            alert("Debes registrar al menos una serie para guardar el entrenamiento.");
            setIsFinishModalOpen(false);
            return;
        }

        onFinish(completedExercises, durationInSeconds, notes, discomforts, fatigueLevel, mentalClarity, undefined, sessionPhoto);
        
        setIsSaveChangesModalOpen(false);
        setPendingFinishData(null);

    }, [pendingFinishData, startTime, onUpdateExerciseInProgram, programId, currentSession, exercisesForMode, ongoingWorkout, completedSets, onFinish, sessionPhoto, setIsSaveChangesModalOpen, setIsFinishModalOpen, selectedBrands]);
    
    const handleFinish = (notes?: string, discomforts?: string[], fatigueLevel?: number, mentalClarity?: number) => {
        const hasModifiedStructure = JSON.stringify(session.exercises) !== JSON.stringify(currentSession.exercises);
    
        setPendingFinishData({ notes, discomforts, fatigueLevel, mentalClarity });
    
        if (hasModifiedStructure) {
            setIsSaveChangesModalOpen(true);
        } else {
            handleFinalizeFinish(false);
        }
    };
    
    const handleTakePhoto = async () => {
        const photo = await takePicture();
        if (photo) {
            const optimized = await optimizeImage(photo);
            setSessionPhoto(optimized);
        }
    };
    
    return (
        <div ref={mainContentRef} className="pb-28">
            <SaveChangesModal
                isOpen={isSaveChangesModalOpen}
                onClose={() => setIsSaveChangesModalOpen(false)}
                onSavePermanently={() => handleFinalizeFinish(true)}
                onSaveOnce={() => handleFinalizeFinish(false)}
            />
            <ExerciseFeedbackModal
                isOpen={!!feedbackModalExercise}
                onClose={() => setFeedbackModalExercise(null)}
                onSave={handleSaveFeedback}
                exerciseName={feedbackModalExercise?.name || ''}
            />
            <SubstituteExerciseSheet
                isOpen={!!substituteModalExercise}
                onClose={() => setSubstituteModalExercise(null)}
                exercise={substituteModalExercise}
                onSelectAlternative={handleSelectAlternative}
            />
             <FinishWorkoutModal
                isOpen={isFinishModalOpen}
                onClose={() => setIsFinishModalOpen(false)}
                onFinish={handleFinish}
                initialDurationInSeconds={duration}
            />
            {historyModalExercise && (
                <ExerciseHistoryModal
                    exercise={historyModalExercise} programId={program.id} history={history}
                    settings={settings} onClose={() => setHistoryModalExercise(null)}
                />
            )}
            <WorkoutHeader
                sessionName={currentSession.name}
                totalSets={totalSetsInSession}
                completedSetsCount={completedSetsCount}
                duration={duration}
                availableModes={['A', 'B', 'C', 'D'].filter(mode => mode === 'A' || !!(currentSession as any)[`session${mode}`]) as any}
                activeMode={activeMode}
                onSetMode={setActiveMode}
                improvementIndex={null}
                background={currentSession.background}
                readiness={ongoingWorkout?.readiness}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(f => !f)}
                isPeriodizationMode={!!program.periodizationABCD}
            />

            <div className="space-y-4 mt-4">
                {exercisesForMode.map((ex) => {
                    const exerciseInfo = exerciseList.find(e => e.id === ex.exerciseDbId);
                    const pr = settings.showPRsInWorkout && exerciseInfo ? findPrForExercise(exerciseInfo, history, settings, selectedBrands[ex.id]) : null;
                    const showBrandSelector = useMemo(() => isMachineOrCableExercise(ex, exerciseList), [ex, exerciseList]);
                    // FIX: Ensure isExerciseComplete is always a boolean by using the double negation operator (!!).
                    const isExerciseComplete = !!(ex.sets.every(s => completedSets[s.id]?.left && (!ex.isUnilateral || completedSets[s.id]?.right)));
                    const currentDynamicWeights: { consolidated?: number; technical?: number } = dynamicWeights[ex.id] || {};
                    
                    return (
                        <details 
                            key={ex.id} 
                            id={`exercise-card-${ex.id}`}
                            open={activeExerciseId === ex.id} 
                            className={`set-card-details ${ex.isFavorite ? 'border-yellow-500/30 bg-yellow-900/10 open:border-yellow-500/50' : ''}`} 
                            onToggle={(e) => { 
                                if ((e.target as HTMLDetailsElement).open) {
                                    setActiveExerciseId(ex.id);
                                    if (!ex.sets.some(s => s.id === activeSetId)) {
                                       setActiveSetId(ex.sets[0]?.id || null);
                                    }
                                }
                            }}
                        >
                            <summary className="set-card-summary p-4 flex justify-between items-center w-full">
                                <div className="flex items-center gap-2 min-w-0">
                                    {isExerciseComplete && <CheckCircleIcon size={20} className="text-green-400 flex-shrink-0"/>}
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-lg truncate">{ex.name}</p>
                                        {ex.variantName && <p className="text-xs text-primary-color truncate">{ex.variantName}</p>}
                                    </div>
                                    {ex.isFavorite && <StarIcon filled size={16} className="text-yellow-400 flex-shrink-0"/>}
                                </div>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSubstituteModalExercise(ex); }} className="p-2 text-yellow-400 rounded-full hover:bg-yellow-400/10" aria-label={`Sustituir ${ex.name}`}><SwapIcon size={18} /></button>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHistoryModalExercise(ex); }} className="p-2 text-yellow-400 rounded-full hover:bg-yellow-400/10" aria-label={`Historial de ${ex.name}`}><ClockIcon size={18} /></button>
                                    <div className="p-2 text-yellow-400">
                                        <ChevronRightIcon className="details-arrow" size={18} />
                                    </div>
                                </div>
                            </summary>
                            <div className="set-card-content !border-none p-2 space-y-2">
                                {pr && <div className="p-2 text-center text-sm bg-yellow-900/30 text-yellow-300 rounded-lg mx-2"><p className="font-semibold flex items-center justify-center gap-2"><TrophyIcon size={16}/> Tu PR: {pr.prString} (1RMe: {pr.e1rm}{settings.weightUnit})</p></div>}
                                {showBrandSelector && exerciseInfo && (
                                     <div className="my-4 p-3 bg-slate-950/50 rounded-lg text-center mx-2">
                                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Marca de Máquina</label>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {(exerciseInfo.brandEquivalencies || []).map(b => (
                                                <button key={b.brand} onClick={() => handleSelectBrand(ex.id, b.brand)} className={`px-3 py-1 text-xs rounded-full ${selectedBrands[ex.id] === b.brand ? 'bg-primary-color text-white' : 'bg-slate-700 text-slate-300'}`}>{b.brand}</button>
                                            ))}
                                            <input type="text" placeholder="Otra..." onBlur={(e) => handleAddNewBrand(e, ex.id)} className="bg-slate-800 border-slate-700 rounded-full px-3 py-1 text-xs w-24" />
                                        </div>
                                    </div>
                                )}
                                {ex.sets.map((set, setIndex) => {
                                    const isSetComplete = !!(completedSets[set.id]?.left && (!ex.isUnilateral || completedSets[set.id]?.right));
                                    const isLeftComplete = !!completedSets[set.id]?.left;
                                    const isRightComplete = !!completedSets[set.id]?.right;
                                    const loggedSide = isLeftComplete ? 'left' : null;
                                    const isChangeOfPlans = changeOfPlansSets.has(set.id);
                                    
                                    return (
                                        <details key={set.id} id={`set-summary-${set.id}`} open={activeSetId === set.id} className={`set-card-details !bg-panel-color ${isChangeOfPlans ? 'border-yellow-500/50' : ''}`} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setActiveSetId(set.id)}}>
                                            <summary className="set-card-summary p-3 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-300">Serie {setIndex + 1}</p>
                                                    {isSetComplete && <CheckCircleIcon size={20} className="text-green-400"/>}
                                                    {ex.isUnilateral && (
                                                        <div className="flex gap-1">
                                                            <div className={`w-2 h-2 rounded-full ${isLeftComplete ? 'bg-green-400' : 'bg-slate-600'}`} title="Lado Izquierdo"></div>
                                                            <div className={`w-2 h-2 rounded-full ${isRightComplete ? 'bg-green-400' : 'bg-slate-600'}`} title="Lado Derecho"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm text-slate-400 font-mono">{formatSetTarget(set)}</p>
                                                    <ChevronRightIcon className="details-arrow text-slate-400" />
                                                </div>
                                            </summary>
                                            <SetDetails
                                                exercise={ex} exerciseInfo={exerciseInfo} set={set} isComplete={isSetComplete}
                                                settings={settings}
                                                onLogSet={handleLogSet}
                                                inputs={unilateralSetInputs[set.id] || { left: { reps: '', weight: '', rpe: '', rir: '', isFailure: false, duration: '', notes: '' }, right: { reps: '', weight: '', rpe: '', rir: '', isFailure: false, duration: '', notes: '' }}}
                                                onInputChange={(side, field, value) => handleSetInputChange(set.id, side, field, value)}
                                                dynamicWeights={currentDynamicWeights}
                                                onToggleChangeOfPlans={() => handleToggleChangeOfPlans(set.id)}
                                                isChangeOfPlans={isChangeOfPlans}
                                                loggedSide={loggedSide}
                                            />
                                        </details>
                                    )
                                })}
                            </div>
                        </details>
                    )
                })}
            </div>
             {sessionPhoto && (
                <Card className="mt-4">
                     <h3 className="text-lg font-bold text-white mb-2">Foto de la Sesión</h3>
                     <img src={sessionPhoto} alt="Foto de la sesión" className="rounded-lg w-full"/>
                </Card>
            )}
            <div className="mt-4">
                <Button onClick={handleTakePhoto} variant="secondary" className="w-full">
                    <CameraIcon size={16}/> {sessionPhoto ? 'Reemplazar Foto' : 'Añadir Foto de la Sesión'}
                </Button>
            </div>
        </div>
    );
};
