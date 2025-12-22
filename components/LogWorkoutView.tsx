// components/LogWorkoutView.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Session, Program, Settings, WorkoutLog, CompletedExercise, CompletedSet, ExerciseSet, Exercise, OngoingWorkoutState, ExerciseMuscleInfo, BrandEquivalency, OngoingSetData } from '../types';
import Button from './ui/Button';
// FIX: Imported the missing `FlameIcon` to resolve a "Cannot find name" error.
import { CheckCircleIcon, TrophyIcon, MinusIcon, PlusIcon, ChevronRightIcon, ClockIcon, XCircleIcon, StarIcon, SwapIcon, BrainIcon, FlameIcon } from './icons';
import FinishWorkoutModal from './FinishWorkoutModal';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import { calculatePlates } from '../utils/plateCalculator';
import { roundWeight, calculateBrzycki1RM, getWeightSuggestionForSet, isMachineOrCableExercise } from '../utils/calculations';
import { useAppDispatch, useAppState } from '../contexts/AppContext';
import SubstituteExerciseSheet from './SubstituteExerciseSheet';
import { hapticImpact, ImpactStyle } from '../services/hapticsService';


// Helper function from WorkoutSession
const findPrForExercise = (exercise: Exercise, history: WorkoutLog[], settings: Settings, currentMachineBrand?: string, brandEquivalencies?: BrandEquivalency[]): { prString: string, e1rm: number, reps: number } | null => {
    let best1RM = 0;
    let prString = '';
    let bestReps = Infinity;
    const exerciseDbId = exercise.exerciseDbId;
    const exerciseNameLower = exercise.name.toLowerCase();

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


// --- Internal Components copied & adapted from WorkoutSession ---

const WorkoutHeader: React.FC<{
    sessionName: string;
    totalSets: number;
    completedSetsCount: number;
    sessionVariant?: 'A' | 'B' | 'C' | 'D';
}> = React.memo(({ sessionName, totalSets, completedSetsCount, sessionVariant }) => (
    <div className="sticky top-0 z-30 bg-[var(--bg-color)] pb-3 animate-fade-in-down">
        <div className="workout-header-card !p-0 relative overflow-hidden">
            <div className="relative z-10 p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {sessionVariant && <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center font-bold text-xl text-white">{sessionVariant}</div>}
                        <div>
                           <h2 className="text-2xl font-bold text-white truncate pr-2">{sessionName}</h2>
                           <p className="text-sm text-slate-400 mt-1">Registrando Manualmente</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-900/50 rounded-xl p-2">
                        <p className="text-2xl font-bold font-mono text-white">--:--</p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Tiempo</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-2">
                        <p className="text-2xl font-bold font-mono text-white">{completedSetsCount}/{totalSets}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Series</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-2">
                        <p className="text-2xl font-bold font-mono text-white">--</p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Volumen</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
));

// Copied from WorkoutSession and fixed
const getTargetIntensityDisplay = (set: ExerciseSet) => {
    switch (set.intensityMode) {
        case 'rpe':
            return { value: set.targetRPE || '-', label: 'RPE Objetivo' };
        case 'rir':
            return { value: set.targetRIR || '-', label: 'RIR Objetivo' };
        case 'failure':
            return { value: <FlameIcon className="text-danger-color"/>, label: 'Al Fallo' };
        case 'approx':
            return { value: 'APROX', label: 'APROX' };
        default: // approx or undefined
             if (set.targetRPE) {
                return { value: set.targetRPE, label: 'RPE Aprox.' };
            }
            if (set.targetRIR) {
                return { value: set.targetRIR, label: 'RIR Aprox.' };
            }
            return { value: 'APROX', label: 'APROX' };
    }
};

const SetDetails: React.FC<{
    exercise: Exercise;
    set: ExerciseSet;
    settings: Settings;
    inputs: { reps: string; weight: string; rpe: string; rir: string; isFailure?: boolean, duration?: string };
    onInputChange: (field: 'reps' | 'weight' | 'rpe' | 'rir' | 'isFailure' | 'duration', value: string | boolean) => void;
    dynamicWeights: { consolidated?: number, technical?: number };
    onToggleChangeOfPlans: () => void;
    isChangeOfPlans: boolean;
    onLogSet: () => void;
    isLogged: boolean;
}> = ({ exercise, set, settings, inputs, onInputChange, dynamicWeights, onToggleChangeOfPlans, isChangeOfPlans, onLogSet, isLogged }) => {
    
    const { consolidated, technical } = dynamicWeights;
    const plateCombination = useMemo(() => {
        const weight = parseFloat(inputs.weight);
        if (isNaN(weight) || weight <= 0) return null;
        return calculatePlates(weight, settings);
    }, [inputs.weight, settings]);

    const handleAdjust = (field: 'reps' | 'weight' | 'duration', amount: number) => {
        const currentValue = parseFloat(inputs[field as 'reps' | 'weight' | 'duration']) || 0;
        let newValue: number;
        if (field === 'weight') {
            const step = settings.weightUnit === 'kg' ? (currentValue < 20 ? 1.25 : 2.5) : 2.5;
            newValue = Math.max(0, currentValue + (amount * step));
        } else {
            newValue = Math.max(0, currentValue + amount);
        }
        onInputChange(field, newValue.toString());
    };
    
    const targetReps = set.targetReps || 0;
    const completedReps = parseInt(inputs.reps, 10) || 0;
    const debt = completedReps - targetReps;
    let debtColor = debt > 0 ? 'rid-positive' : debt < 0 ? 'rid-negative' : '';
    let debtSign = debt > 0 ? '+' : '';
    const intensityDisplay = getTargetIntensityDisplay(set);

    return (
        <div className="set-card-content space-y-6 p-4">
             <div className="grid grid-cols-3 gap-3">
                {isChangeOfPlans ? (
                    <div className="target-stat-card col-span-2"><span className="value text-yellow-400"><BrainIcon/></span><span className="label">Modo Libre</span></div>
                ) : (
                    <>
                        <div className="target-stat-card"><span className="value">{set.targetReps || `${set.targetDuration}s` || '-'}</span><span className="label">Objetivo</span></div>
                        {(exercise.trainingMode || 'reps') === 'reps' ? (
                             <div className="target-stat-card">
                                 <span className={`value ${debtColor}`}>{debtSign}{debt}</span>
                                 <span className="label">Deuda de Reps</span>
                             </div>
                        ) : (
                            <div className="target-stat-card"><span className="value">{set.targetPercentageRM || '-'}<span>{set.targetPercentageRM ? '%' : ''}</span></span><span className="label">% 1RM</span></div>
                        )}
                    </>
                )}
                 <div className="target-stat-card">
                    <span className={`value ${typeof intensityDisplay.value === 'string' ? '!text-2xl' : ''}`}>{intensityDisplay.value}</span>
                    <span className="label">{intensityDisplay.label}</span>
                </div>
            </div>
            
            {(exercise.trainingMode || 'reps') === 'reps' && (consolidated || technical) && (
                 <div className="flex justify-center gap-2">
                    {consolidated && (
                        <button onClick={() => onInputChange('weight', String(consolidated))} className="weight-preset-chip">
                           Consolidado: {consolidated}{settings.weightUnit}
                        </button>
                    )}
                     {technical && (
                        <button onClick={() => onInputChange('weight', String(technical))} className="weight-preset-chip technical">
                           Técnico: {technical}{settings.weightUnit}
                        </button>
                    )}
                </div>
            )}
            <div className="flex flex-col items-center gap-6">
                {exercise.trainingMode === 'time' ? (
                    <div className="w-full max-w-xs text-center">
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Duración (s)</label>
                        <div className="flex items-center justify-center gap-3">
                            <button type="button" onClick={() => handleAdjust('duration', -5)} className="workout-adjust-btn"><MinusIcon/></button>
                            <input type="number" inputMode="numeric" value={inputs.duration} onChange={e => onInputChange('duration', e.target.value)} className="workout-input-v2 !h-16 !w-24 !text-4xl"/>
                            <button type="button" onClick={() => handleAdjust('duration', 5)} className="workout-adjust-btn"><PlusIcon/></button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-xs text-center">
                        <label className="text-sm font-semibold text-slate-300 mb-2 block">Reps Completadas</label>
                        <div className="flex items-center justify-center gap-3">
                            <button type="button" onClick={() => handleAdjust('reps', -1)} className="workout-adjust-btn"><MinusIcon/></button>
                            <input type="number" inputMode="numeric" value={inputs.reps} onChange={e => onInputChange('reps', e.target.value)} className="workout-input-v2 !h-16 !w-24 !text-4xl"/>
                            <button type="button" onClick={() => handleAdjust('reps', 1)} className="workout-adjust-btn"><PlusIcon/></button>
                        </div>
                    </div>
                )}
                 <div className="w-full max-w-xs text-center">
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Peso ({settings.weightUnit})</label>
                    <div className="flex items-center justify-center gap-3">
                        <button type="button" onClick={() => handleAdjust('weight', -1)} className="workout-adjust-btn"><MinusIcon/></button>
                        <input type="number" inputMode="decimal" step="0.5" value={inputs.weight} onChange={e => onInputChange('weight', e.target.value)} className="workout-input-v2"/>
                        <button type="button" onClick={() => handleAdjust('weight', 1)} className="workout-adjust-btn"><PlusIcon/></button>
                    </div>
                </div>
            </div>
             <div className="flex items-center justify-center gap-4">
                 <Button onClick={onLogSet} className="w-full max-w-xs !py-3 !text-lg">{isLogged ? 'Actualizar Serie' : 'Guardar Serie'}</Button>
                 <button onClick={onToggleChangeOfPlans} title="Modo Libre / Cambio de Planes" className={`p-3 rounded-lg transition-all duration-200 ${isChangeOfPlans ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/80' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    <BrainIcon size={24}/>
                </button>
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

// --- Main Component ---
interface LogWorkoutViewProps {
  sessionInfo: { session: Session, program: Program };
  settings: Settings;
  history: WorkoutLog[];
  onSave: (log: WorkoutLog) => void;
  onCancel: () => void;
  isFinishModalOpen: boolean;
  setIsFinishModalOpen: (isOpen: boolean) => void;
  onUpdateExercise1RM: (exerciseDbId: string | undefined, exerciseName: string, new1RM: number | null, reps: number, testDate?: string, machineBrand?: string) => void;
  onUpdateExerciseInProgram: (programId: string, sessionId: string, exerciseId: string, updatedExercise: Exercise) => void;
  exerciseList: ExerciseMuscleInfo[];
}

const LogWorkoutView: React.FC<LogWorkoutViewProps> = ({ sessionInfo, settings, history, onSave, onCancel, isFinishModalOpen, setIsFinishModalOpen, onUpdateExercise1RM, onUpdateExerciseInProgram, exerciseList }) => {
  const { program } = sessionInfo;
  const { addToast } = useAppDispatch();
  
  const [currentSession, setCurrentSession] = useState<Session>(sessionInfo.session);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(currentSession.exercises[0]?.id || null);
  const [activeSetId, setActiveSetId] = useState<string | null>(currentSession.exercises[0]?.sets[0]?.id || null);
  
  const [setInputs, setSetInputs] = useState<Record<string, { reps: string; weight: string; rpe: string; rir: string; isFailure?: boolean, duration?: string }>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, OngoingSetData>>({});
  const [dynamicWeights, setDynamicWeights] = useState<Record<string, { consolidated?: number, technical?: number }>>({});
  const [historyModalExercise, setHistoryModalExercise] = useState<Exercise | null>(null);
  const [substituteModalExercise, setSubstituteModalExercise] = useState<Exercise | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Record<string, string>>({});
  const [changeOfPlansSets, setChangeOfPlansSets] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initialWeights: Record<string, { consolidated?: number; technical?: number }> = {};
    currentSession.exercises.forEach(ex => {
        if ((ex.trainingMode || 'reps') === 'reps') {
            const lastUsedWeight = history.slice().reverse().flatMap(log => log.completedExercises).find(ce => ce.exerciseId === ex.id)?.sets.slice(-1)[0]?.weight;
            initialWeights[ex.id] = { consolidated: ex.sets[0]?.consolidatedWeight || lastUsedWeight, technical: ex.sets[0]?.technicalWeight };
        }
    });
    setDynamicWeights(initialWeights);
  }, [currentSession.exercises, history]);

  useEffect(() => {
    const currentExercise = currentSession.exercises.find(ex => ex.id === activeExerciseId);
    if (currentExercise) {
        const newInputs = { ...setInputs };
        currentExercise.sets.forEach((set, setIndex) => {
            if (!newInputs[set.id]) {
                if (completedSets[set.id]) {
                    const completed = completedSets[set.id];
                    newInputs[set.id] = { 
                        reps: completed.reps?.toString() || '',
                        duration: completed.duration?.toString() || '',
                        weight: completed.weight.toString(),
                        rpe: completed.rpe?.toString() || '',
                        rir: completed.rir?.toString() || '',
                        isFailure: false,
                    };
                } else {
                    const completedSetsForThisExercise = Object.entries(completedSets)
                        .filter(([setId, _]) => currentExercise.sets.some(s => s.id === setId))
                        // FIX: Add type assertion to fix 'unknown' type error from Object.entries.
                        .map(([_, data]) => ({ reps: (data as OngoingSetData).reps || 0, weight: (data as OngoingSetData).weight }));
                    
                    const exerciseInfo = exerciseList.find(e => e.id === currentExercise.exerciseDbId);
                    // FIX: Removed extra argument `dynamicWeights[currentExercise.id] || {}`
                    const suggestedWeight = getWeightSuggestionForSet(
                        currentExercise, exerciseInfo, setIndex, completedSetsForThisExercise, 
                        settings, history, selectedBrands[currentExercise.id]
                    );
                    newInputs[set.id] = { reps: set.targetReps?.toString() || '', duration: set.targetDuration?.toString() || '', weight: suggestedWeight?.toString() || '', rpe: '', rir: '', isFailure: false };
                }
            }
        });
        setSetInputs(newInputs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExerciseId, activeSetId, currentSession.exercises, dynamicWeights, settings, history, completedSets, selectedBrands]);

  const handleSetInputChange = (setId: string, field: keyof typeof setInputs[string], value: string | boolean) => {
      setSetInputs(prev => ({
          ...prev,
          [setId]: { ...(prev[setId] || { reps: '', weight: '', rpe: '', rir: '', duration: '' }), [field]: value }
      }));
  };

  const handleLogSet = (exercise: Exercise, set: ExerciseSet) => {
    const inputs = setInputs[set.id] || { reps: '', weight: '', rpe: '', rir: '', duration: '' };
    // FIX: Use a more robust check to ensure `reps` is a valid number before using it in calculations.
    const repsRaw = inputs.reps ? parseInt(inputs.reps, 10) : undefined;
    const reps = (repsRaw !== undefined && !isNaN(repsRaw)) ? repsRaw : undefined;
    const duration = inputs.duration ? parseInt(inputs.duration, 10) : undefined;
    const weight = parseFloat(inputs.weight);

    if (isNaN(weight) || (reps === undefined && duration === undefined)) { return; }
    
    const rpe = inputs.rpe ? parseFloat(inputs.rpe) : undefined;
    const rir = inputs.rir ? parseInt(inputs.rir, 10) : undefined;
    const machineBrand = selectedBrands[exercise.id];
    const isChangeOfPlans = changeOfPlansSets.has(set.id);

    setCompletedSets(prev => ({ ...prev, [set.id]: { reps, duration, weight, rpe, rir, machineBrand, isChangeOfPlans } }));
    hapticImpact(ImpactStyle.Light);
    
    const targetReps = set.targetReps || 0;
    if (reps !== undefined && (exercise.trainingMode || 'reps') === 'reps' && reps >= targetReps) {
        const currentConsolidated = dynamicWeights[exercise.id]?.consolidated || 0;
        if (weight > currentConsolidated) {
            const newConsolidated = weight;
            const newTechnical = roundWeight(newConsolidated * 0.8, settings.weightUnit);
            setDynamicWeights(prev => ({ ...prev, [exercise.id]: { consolidated: newConsolidated, technical: newTechnical } }));
            addToast(`¡Nuevos Pesos de Progresión para ${exercise.name}!`, 'suggestion', '¡Progreso Desbloqueado!');
        }
    }
    if (typeof reps === 'number') {
        const newE1RM = calculateBrzycki1RM(weight, reps);
        onUpdateExercise1RM(exercise.exerciseDbId, exercise.name, newE1RM, reps, new Date().toISOString(), machineBrand);
    }
  };
  
    const handleToggleChangeOfPlans = (setId: string) => {
        setChangeOfPlansSets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setId)) {
                newSet.delete(setId);
            } else {
                newSet.add(setId);
            }
            return newSet;
        });
        hapticImpact(ImpactStyle.Light);
    };

  const handleSelectBrand = (exerciseId: string, brand?: string) => {
        setSelectedBrands(prev => ({ ...prev, [exerciseId]: brand! }));
  };

  const handleFinish = useCallback((notes?: string, discomforts?: string[], fatigueLevel?: number, mentalClarity?: number, durationInMinutes?: number, logDate?: string) => {
    Object.entries(dynamicWeights).forEach(([exerciseId, weights]) => {
        const exerciseToUpdate = currentSession.exercises.find(ex => ex.id === exerciseId);
        const typedWeights = weights as { consolidated?: number, technical?: number };
        if (exerciseToUpdate && (typedWeights.consolidated !== undefined || typedWeights.technical !== undefined)) {
            const updatedExercise = { ...exerciseToUpdate, sets: exerciseToUpdate.sets.map(s => ({ ...s, consolidatedWeight: typedWeights.consolidated, technicalWeight: typedWeights.technical })) as ExerciseSet[] };
            onUpdateExerciseInProgram(program.id, currentSession.id, exerciseId, updatedExercise);
        }
    });

    const completedExercises: CompletedExercise[] = currentSession.exercises.map(ex => ({
      exerciseId: ex.id, exerciseDbId: ex.exerciseDbId, exerciseName: ex.name,
      sets: ex.sets.map(set => ({ 
          id: set.id, targetReps: set.targetReps, targetRPE: set.targetRPE, 
          completedReps: completedSets[set.id]?.reps,
          completedDuration: completedSets[set.id]?.duration,
          weight: completedSets[set.id]?.weight,
          completedRPE: completedSets[set.id]?.rpe,
          completedRIR: completedSets[set.id]?.rir,
          machineBrand: completedSets[set.id]?.machineBrand,
          isChangeOfPlans: completedSets[set.id]?.isChangeOfPlans,
      })).filter(s => (s.completedReps !== undefined || s.completedDuration !== undefined) && s.weight !== undefined) as CompletedSet[],
    })).filter(ex => ex.sets.length > 0);

    if (completedExercises.length === 0) {
        alert("Debes registrar al menos una serie para guardar el entrenamiento.");
        setIsFinishModalOpen(false);
        return;
    }

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(), programId: program.id, programName: program.name,
      sessionId: currentSession.id, sessionName: currentSession.name, 
      date: logDate ? new Date(logDate + 'T12:00:00Z').toISOString() : new Date().toISOString(),
      duration: (typeof durationInMinutes === 'number' && !isNaN(durationInMinutes)) ? durationInMinutes * 60 : undefined,
      completedExercises, notes, discomforts,
      fatigueLevel: fatigueLevel || 5, mentalClarity: mentalClarity || 5,
      gymName: settings.gymName,
      photoUri: undefined,
    };
    onSave(newLog);
  }, [completedSets, dynamicWeights, onSave, program, currentSession, onUpdateExerciseInProgram, settings.gymName, setIsFinishModalOpen]);

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

  const completedSetsCount = useMemo(() => Object.keys(completedSets).length, [completedSets]);
  const totalSetsInSession = useMemo(() => currentSession.exercises.reduce((acc, ex) => acc + ex.sets.length, 0), [currentSession.exercises]);

  return (
    <div className="pb-28">
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
            mode="log"
            initialDurationInSeconds={3600}
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
        />
        <div className="space-y-2 mt-4">
            {currentSession.exercises.map((ex, exIndex) => {
                const pr = settings.showPRsInWorkout ? findPrForExercise(ex, history, settings, selectedBrands[ex.id], ex.brandEquivalencies) : null;
                const showBrandSelector = useMemo(() => isMachineOrCableExercise(ex, exerciseList), [ex, exerciseList]);
                const isExerciseComplete = ex.sets.every(s => completedSets[s.id]);
                const exerciseSetsDone = ex.sets.filter(s => completedSets[s.id]).length;
                const currentDynamicWeights: { consolidated?: number; technical?: number } = dynamicWeights[ex.id] || {};
                return (
                    <details key={ex.id} open={activeExerciseId === ex.id} className={`set-card-details ${ex.isFavorite ? 'border-yellow-500/30 bg-yellow-900/10 open:border-yellow-500/50' : ''}`} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setActiveExerciseId(ex.id)}}>
                        <summary className="set-card-summary p-4 !items-start">
                             <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isExerciseComplete ? 'bg-success-color text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {isExerciseComplete ? <CheckCircleIcon size={20}/> : exIndex + 1}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="font-bold text-white text-lg truncate">{ex.name}</p>
                                        <span className="text-sm text-slate-400 flex-shrink-0">{exerciseSetsDone} / {ex.sets.length} series</span>
                                    </div>
                                    {ex.isFavorite && <StarIcon filled size={16} className="text-yellow-400 mt-1"/>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSubstituteModalExercise(ex); }} className="p-1 text-slate-500 hover:text-primary-color" aria-label={`Sustituir ${ex.name}`}><SwapIcon size={20} /></button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setHistoryModalExercise(ex); }} className="p-1 text-slate-500 hover:text-primary-color" aria-label={`Historial de ${ex.name}`}><ClockIcon size={20} /></button>
                                <ChevronRightIcon className="details-arrow text-slate-400" />
                            </div>
                        </summary>
                        <div className="set-card-content !border-none !p-2 space-y-2">
                            {pr && <div className="p-2 text-center text-sm bg-yellow-900/30 text-yellow-300 rounded-lg"><p className="font-semibold flex items-center justify-center gap-2"><TrophyIcon size={16}/> Tu PR: {pr.prString} (1RMe: {pr.e1rm}{settings.weightUnit})</p></div>}
                            {showBrandSelector && (
                                <div className="px-2 pb-2">
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Marca de Máquina:</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => handleSelectBrand(ex.id, undefined)} className={`weight-preset-chip !text-xs ${!selectedBrands[ex.id] ? '!bg-primary-color' : ''}`}>Base</button>
                                        {(ex.brandEquivalencies || []).map(b => (
                                            <button key={b.brand} onClick={() => handleSelectBrand(ex.id, b.brand)} className={`weight-preset-chip !text-xs ${selectedBrands[ex.id] === b.brand ? '!bg-primary-color' : ''}`}>{b.brand}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {ex.sets.map((set, setIndex) => {
                                const isSetLogged = !!completedSets[set.id];
                                const isChangeOfPlans = changeOfPlansSets.has(set.id);
                                return (
                                    <details key={set.id} open={activeSetId === set.id} className={`set-card-details !bg-panel-color ${isChangeOfPlans ? 'border-yellow-500/50' : ''}`} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) setActiveSetId(set.id)}}>
                                        <summary className="set-card-summary p-3">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-300">Serie {setIndex + 1}</p>
                                                {set.advancedTechnique && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-800 text-sky-300 uppercase">{set.advancedTechnique.replace('-', ' ')}</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-slate-400 font-mono">{formatSetTarget(set)}</p>
                                                {isSetLogged && <CheckCircleIcon size={20} className="text-green-400"/>}
                                                <ChevronRightIcon className="details-arrow text-slate-400" />
                                            </div>
                                        </summary>
                                        <SetDetails
                                            exercise={ex} set={set}
                                            settings={settings}
                                            inputs={setInputs[set.id] || { reps: '', weight: '', rpe: '', rir: '', isFailure: false, duration: ''}}
                                            onInputChange={(field, value) => handleSetInputChange(set.id, field, value)}
                                            dynamicWeights={currentDynamicWeights}
                                            onToggleChangeOfPlans={() => handleToggleChangeOfPlans(set.id)}
                                            isChangeOfPlans={isChangeOfPlans}
                                            onLogSet={() => handleLogSet(ex, set)}
                                            isLogged={isSetLogged}
                                        />
                                    </details>
                                )
                            })}
                        </div>
                    </details>
                );
            })}
        </div>
    </div>
  );
};

export default LogWorkoutView;