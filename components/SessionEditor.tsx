// components/SessionEditor.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Session, Exercise, ExerciseSet, Settings, WarmupStep, SessionBackground, ExerciseMuscleInfo, BrandEquivalency } from '../types';
import { generateSession, generateWarmupForSession } from '../services/aiService';
import { PlusIcon, TrashIcon, SparklesIcon, LinkIcon, StarIcon, FlameIcon, ArrowDownIcon, ArrowUpIcon, TrophyIcon, XIcon, ChevronRightIcon, CalculatorIcon, SwapIcon, Wand2Icon, BrainIcon, InfoIcon, ZapIcon, ClipboardPlusIcon } from './icons';
import Button from './ui/Button';
import { MUSCLE_GROUPS } from '../data/exerciseList';
import { calculateBrzycki1RM, estimatePercent1RM, roundWeight, isMachineOrCableExercise } from '../utils/calculations';
import Modal from './ui/Modal';
import BackgroundEditorModal from './SessionBackgroundModal';
import { useAppContext } from '../contexts/AppContext';
import ExerciseInfoModal from './ExerciseInfoModal';
import { storageService } from '../services/storageService';
import { calculateSessionVolume } from '../services/analysisService';
import { WorkoutVolumeAnalysis } from './WorkoutVolumeAnalysis';

interface SessionEditorProps {
  onSave: (session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
  onCancel: () => void;
  existingSessionInfo: { session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string } | null;
  isOnline: boolean;
  settings: Settings;
  saveTrigger: number;
  addExerciseTrigger: number;
  exerciseList: ExerciseMuscleInfo[];
}

const SESSION_DRAFT_KEY = 'session-editor-draft';

interface MacroParameters {
  setsCount?: number;
  targetReps?: number;
  restTime?: number;
  intensityMode?: 'approx' | 'rpe' | 'rir' | 'failure';
  targetRPE?: number;
  targetRIR?: number;
}


const RMCalculator: React.FC<{
  on1RMSet: (value: number) => void;
  settings: Settings;
}> = ({ on1RMSet, settings }) => {
  const [calcMode, setCalcMode] = useState<'direct' | 'pr'>('direct');
  const [directRM, setDirectRM] = useState('');
  const [prWeight, setPrWeight] = useState('');
  const [prReps, setPrReps] = useState('');

  const estimated1RM = useMemo(() => {
    const weight = parseFloat(prWeight);
    const reps = parseInt(prReps, 10);
    if (weight > 0 && reps > 0) {
      const result = calculateBrzycki1RM(weight, reps);
      return Math.round(result * 10) / 10;
    }
    return null;
  }, [prWeight, prReps]);

  return (
    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-700 space-y-4">
      <h4 className="text-md font-semibold text-white flex items-center gap-2"><CalculatorIcon /> Configurar 1RM de Trabajo</h4>
      <div className="flex bg-slate-800 p-1 rounded-full text-sm">
        <button type="button" onClick={() => setCalcMode('direct')} className={`flex-1 py-1 rounded-full ${calcMode === 'direct' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Directo</button>
        <button type="button" onClick={() => setCalcMode('pr')} className={`flex-1 py-1 rounded-full ${calcMode === 'pr' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Estimar de PR</button>
      </div>
      {calcMode === 'direct' ? (
        <div className="flex gap-2">
          <input type="number" value={directRM} onChange={e => setDirectRM(e.target.value)} placeholder={`1RM en ${settings.weightUnit}`} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center" />
          <Button onClick={() => on1RMSet(parseFloat(directRM))} disabled={!directRM || parseFloat(directRM) <= 0}>Guardar</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="number" value={prWeight} onChange={e => setPrWeight(e.target.value)} placeholder={`Peso (${settings.weightUnit})`} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center" />
            <span className="flex items-center font-bold">x</span>
            <input type="number" value={prReps} onChange={e => setPrReps(e.target.value)} placeholder="Reps" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-center" />
          </div>
          {estimated1RM !== null && (
            <div className="text-center animate-fade-in">
              <p className="text-sm text-slate-400">1RM Estimado: <span className="font-bold text-lg text-white">{estimated1RM} {settings.weightUnit}</span></p>
              <Button onClick={() => on1RMSet(estimated1RM)} className="mt-2">Usar este 1RM</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Joker Exercise Mini-Editor
const JokerExerciseEditor: React.FC<{
    exercise: Exercise;
    onJokerNameChange: (name: string | undefined) => void;
}> = ({ exercise, onJokerNameChange }) => {
    const [jokerName, setJokerName] = useState<string>(exercise.jokerExerciseName || '');
    const [isEditing, setIsEditing] = useState(!!exercise.jokerExerciseName);

    const handleSave = () => {
        onJokerNameChange(jokerName.trim() ? jokerName.trim() : undefined);
    };

    const handleRemove = () => {
        setJokerName('');
        onJokerNameChange(undefined);
        setIsEditing(false);
    }

    if (!isEditing) {
        return <Button variant="secondary" className="!text-xs" onClick={() => setIsEditing(true)}><PlusIcon size={12}/> Añadir Comodín</Button>;
    }

    return (
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 space-y-2 mt-2">
            <div className="flex justify-between items-center">
                <h5 className="text-sm font-semibold text-slate-300 flex items-center gap-1"><SwapIcon size={14}/> Ejercicio Comodín</h5>
                <button onClick={handleRemove}><TrashIcon size={14} className="text-slate-500 hover:text-red-400"/></button>
            </div>
            <input 
                type="text" 
                value={jokerName} 
                onChange={(e) => setJokerName(e.target.value)} 
                onBlur={handleSave} // Save on blur
                placeholder="Nombre del ejercicio sustituto" 
                className="w-full bg-slate-800 border-slate-700 rounded p-1 text-sm"
            />
        </div>
    );
};

const ProgressionWeightsModal: React.FC<{
    exercise: Exercise;
    settings: Settings;
    onSave: (consolidated?: number, technical?: number) => void;
    onClose: () => void;
}> = ({ exercise, settings, onSave, onClose }) => {
    const [consolidated, setConsolidated] = useState<string>(exercise.sets[0]?.consolidatedWeight?.toString() || '');
    const [technical, setTechnical] = useState<string>(exercise.sets[0]?.technicalWeight?.toString() || '');
    
    const handleSave = () => {
        const consNum = consolidated ? parseFloat(consolidated) : undefined;
        const techNum = technical ? parseFloat(technical) : undefined;
        onSave(consNum, techNum);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Pesos de Progresión para ${exercise.name}`}>
            <div className="p-2 space-y-4">
                <p className="text-sm text-slate-400">Establece los pesos base que usarás para este ejercicio. Se aplicarán a todas las series.</p>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Peso Consolidado ({settings.weightUnit})</label>
                    <input type="number" step="0.5" value={consolidated} onChange={e => setConsolidated(e.target.value)} placeholder="El peso que ya dominas" className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    <p className="text-xs text-slate-500 mt-1">El peso que puedes manejar cómodamente para las repeticiones objetivo.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Peso Técnico ({settings.weightUnit})</label>
                    <input type="number" step="0.5" value={technical} onChange={e => setTechnical(e.target.value)} placeholder="Un peso más ligero" className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    <p className="text-xs text-slate-500 mt-1">Un peso ligero para series de calentamiento o para enfocarse en la técnica.</p>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Pesos</Button>
                </div>
            </div>
        </Modal>
    );
};

const BrandHomologationEditor: React.FC<{ onAdd: (brand: BrandEquivalency) => void }> = ({ onAdd }) => {
    const [brand, setBrand] = useState('');
    const [baseWeight, setBaseWeight] = useState('');
    const [equivalentWeight, setEquivalentWeight] = useState('');

    const handleAdd = () => {
        const base = parseFloat(baseWeight);
        const equivalent = parseFloat(equivalentWeight);
        if (!brand.trim() || !base || !equivalent || base <= 0) {
            alert("Por favor, completa todos los campos correctamente.");
            return;
        }
        
        const ratio = Math.round((equivalent / base) * 100) / 100;
        
        onAdd({
            brand: brand.trim(),
            ratio,
        });

        setBrand('');
        setBaseWeight('');
        setEquivalentWeight('');
    };

    return (
        <div className="pt-3 border-t border-slate-800 space-y-2">
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Nombre de la marca" className="w-full text-xs" />
            <div className="grid grid-cols-2 gap-2">
                <input type="number" value={baseWeight} onChange={e => setBaseWeight(e.target.value)} placeholder="Peso Base (ej. 100)" className="w-full text-xs" />
                <input type="number" value={equivalentWeight} onChange={e => setEquivalentWeight(e.target.value)} placeholder="Peso Equivalente (ej. 120)" className="w-full text-xs" />
            </div>
            <p className="text-[10px] text-slate-500">Ej: Si 100kg en la máquina base se sienten como 120kg en esta, el ratio será 1.2x.</p>
            <Button onClick={handleAdd} variant="secondary" className="!text-xs !py-1 w-full"><PlusIcon size={14}/> Añadir Homologación</Button>
        </div>
    );
};


// Reusable component for editing a single exercise
const ExerciseEditor: React.FC<{
  exercise: Exercise;
  exIndex: number;
  totalExercises: number;
  settings: Settings;
  activeSuggestion: { index: number; query: string } | null;
  autoCalculatedFields: Set<string>;
  onExerciseChange: (index: number, field: keyof Exercise, value: any) => void;
  onExerciseNameChange: (index: number, value: string) => void;
  onSuggestionClick: (exIndex: number, exerciseName: string) => void;
  onRemoveExercise: (index: number) => void;
  onSetChange: (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => void;
  onAddSet: (exIndex: number) => void;
  onRemoveSet: (exIndex: number, setIndex: number) => void;
  onMoveExercise: (index: number, direction: 'up' | 'down') => void;
  muscleFilter: string;
  exerciseList: ExerciseMuscleInfo[];
  filteredSuggestions: (query: string, muscleFilter: string) => ExerciseMuscleInfo[];
  setInfoModalExercise: (exercise: ExerciseMuscleInfo | null) => void;
}> = ({
  exercise, exIndex, totalExercises, settings, activeSuggestion, autoCalculatedFields,
  onExerciseChange, onExerciseNameChange, onSuggestionClick, onRemoveExercise,
  onSetChange, onAddSet, onRemoveSet, onMoveExercise, muscleFilter,
  exerciseList, filteredSuggestions, setInfoModalExercise
}) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const isNewExercise = useMemo(() => !exercise.name, [exercise.name]);
  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState(false);
  const showBrandHomologation = useMemo(() => isMachineOrCableExercise(exercise, exerciseList), [exercise, exerciseList]);

  useEffect(() => {
    if ((exIndex === 0 && totalExercises === 1) || (exIndex === totalExercises - 1 && isNewExercise)) {
        if (detailsRef.current) {
            detailsRef.current.open = true;
        }
    }
  }, [exIndex, totalExercises, isNewExercise]);
  
  const trainingMode = exercise.trainingMode || 'reps';
  const isBodyweightExercise = useMemo(() => {
      const dbInfo = exerciseList.find(e => e.id === exercise.exerciseDbId || e.name.toLowerCase() === exercise.name.toLowerCase());
      return dbInfo?.equipment === 'Peso Corporal';
  }, [exercise.name, exercise.exerciseDbId, exerciseList]);

  const handleSaveProgressionWeights = (consolidated?: number, technical?: number) => {
    // This needs to update all sets of the exercise
    const newSets = exercise.sets.map(set => ({ ...set, consolidatedWeight: consolidated, technicalWeight: technical }));
    onExerciseChange(exIndex, 'sets', newSets);
    setIsProgressionModalOpen(false);
  };
  
  const handleRemoveBrand = (brandIndex: number) => {
      const updatedBrands = (exercise.brandEquivalencies || []).filter((_, i) => i !== brandIndex);
      onExerciseChange(exIndex, 'brandEquivalencies', updatedBrands);
  };
  
  const isPotentiallyUnilateral = useMemo(() => {
    const name = exercise.name?.toLowerCase() || '';
    const notes = exercise.notes?.toLowerCase() || '';
    const keywords = ['unilateral', 'búlgara', 'bulgara', 'a una mano', 'a una pierna', 'a 1 mano', 'a 1 pierna'];
    return keywords.some(kw => name.includes(kw) || notes.includes(kw));
  }, [exercise.name, exercise.notes]);

  const renderTargetInput = (set: ExerciseSet, setIndex: number) => {
      const isAutoCalculated = autoCalculatedFields.has(`${exIndex}-${setIndex}-targetPercentageRM`);
      switch (exercise.trainingMode) {
          case 'time': return <input type="number" value={set.targetDuration ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetDuration', e.target.value)} placeholder="Segs" className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />;
          case 'distance': return <input type="number" value={set.targetDistance ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetDistance', e.target.value)} placeholder="Metros" className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />;
          case 'custom': return <input type="text" value={set.targetCustom ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetCustom', e.target.value)} placeholder={exercise.customUnit || 'Valor'} className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />;
          case 'percent': return (
            <div className="space-y-1">
                <input type="number" value={set.targetReps ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetReps', e.target.value)} placeholder="Reps" className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />
                <div className="relative">
                    <input type="number" value={set.targetPercentageRM ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetPercentageRM', e.target.value)} placeholder="% 1RM" className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />
                    {isAutoCalculated && <div className="absolute top-1 right-1 text-sky-400" title="Auto-calculado"><SparklesIcon size={12}/></div>}
                </div>
            </div>
          );
          default: return <input type="number" value={set.targetReps ?? ''} onChange={e => onSetChange(exIndex, setIndex, 'targetReps', e.target.value)} placeholder="Reps" className="w-full bg-slate-800 border-slate-700 rounded-lg p-1 text-center" />;
      }
  };

  return (
    <details ref={detailsRef} className={`group glass-card overflow-hidden transition-all duration-300`}>
        {isProgressionModalOpen && (
            <ProgressionWeightsModal 
                exercise={exercise} 
                settings={settings}
                onSave={handleSaveProgressionWeights}
                onClose={() => setIsProgressionModalOpen(false)}
            />
        )}
        <summary className="px-4 py-4 cursor-pointer flex justify-between items-center list-none" onClick={(e) => {
            // Prevent toggling if a button inside was clicked
            if ((e.target as HTMLElement).closest('button')) {
                e.preventDefault();
            }
        }}>
             <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col">
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveExercise(exIndex, 'up'); }} disabled={exIndex === 0} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowUpIcon size={16}/></button>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveExercise(exIndex, 'down'); }} disabled={exIndex === totalExercises - 1} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowDownIcon size={16}/></button>
                </div>
                <span className="font-bold text-lg text-white truncate">{exercise.name || 'Nuevo Ejercicio'}</span>
             </div>
             <div className="flex items-center gap-4 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trainingMode === 'percent' ? 'bg-sky-800 text-sky-300' : trainingMode === 'time' ? 'bg-indigo-800 text-indigo-300' : 'bg-slate-700 text-slate-300'}`}>
                  {trainingMode.charAt(0).toUpperCase() + trainingMode.slice(1)}
                </span>
                {exercise.isSupersetStart && <LinkIcon size={16} className="text-primary-color"/>}
                {exercise.isFavorite && <StarIcon filled size={16} className="text-yellow-400"/>}
                <ChevronRightIcon className="details-arrow transition-transform"/>
            </div>
        </summary>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex">
              <div className="flex-grow min-w-0 space-y-4">
                  <div>
                      <div className="relative">
                          <div className="flex items-center border-b-2 border-slate-700 focus-within:border-primary-color transition-colors">
                              <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => onExerciseNameChange(exIndex, e.target.value)}
                                  placeholder="Nombre del Ejercicio"
                                  required
                                  className="flex-grow min-w-0 w-full text-lg font-bold bg-transparent focus:outline-none text-white py-1"
                              />
                               <button type="button" onClick={(e) => {
                                    e.stopPropagation();
                                    const exerciseData = exerciseList.find(e => e.id === exercise.exerciseDbId || e.name.toLowerCase() === exercise.name.toLowerCase());
                                    if (exerciseData) setInfoModalExercise(exerciseData);
                                    else if (exercise.name) alert("Guarda la sesión para poder ver la información de este nuevo ejercicio.");
                                }} className="p-2 text-slate-400 hover:text-primary-color">
                                    <InfoIcon />
                                </button>
                          </div>
                          {activeSuggestion?.index === exIndex && activeSuggestion.query && 
                           (filteredSuggestions(activeSuggestion.query, muscleFilter).length > 0 || (!exerciseList.some(ex => ex.name.toLowerCase() === activeSuggestion.query.toLowerCase()) && activeSuggestion.query.length > 2)) && (
                              <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto">
                                  {filteredSuggestions(activeSuggestion.query, muscleFilter).map(suggestion => (
                                      <li key={suggestion.id} className="px-4 py-2 text-white cursor-pointer hover:bg-primary-color" onClick={() => onSuggestionClick(exIndex, suggestion.name)}>
                                          {suggestion.name}
                                      </li>
                                  ))}
                                  {!exerciseList.some(ex => ex.name.toLowerCase() === activeSuggestion.query.toLowerCase()) && activeSuggestion.query.length > 2 && (
                                      <li 
                                          className="px-4 py-2 text-primary-color cursor-pointer hover:bg-primary-color hover:text-white flex items-center gap-2" 
                                          onClick={() => onSuggestionClick(exIndex, activeSuggestion.query)}
                                      >
                                          <PlusIcon size={16}/>
                                          <span>Crear ejercicio: <span className="font-bold">"{activeSuggestion.query}"</span></span>
                                      </li>
                                  )}
                              </ul>
                          )}
                      </div>
                       <input
                            type="text"
                            value={exercise.variantName || ''}
                            onChange={(e) => onExerciseChange(exIndex, 'variantName', e.target.value)}
                            placeholder="Añadir variante (ej: con pausa, agarre ancho...)"
                            className="w-full text-sm bg-transparent focus:outline-none text-primary-color mt-1 px-1"
                        />
                  </div>
                  
                  {isBodyweightExercise && (
                    <div className="bg-slate-900/50 p-3 rounded-lg animate-fade-in space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`bodyweight-toggle-${exercise.id}`} className="block text-sm font-medium text-slate-300">
                                Usar Peso Corporal + Lastre
                            </label>
                            <button
                                id={`bodyweight-toggle-${exercise.id}`}
                                type="button"
                                onClick={() => onExerciseChange(exIndex, 'useBodyweight', !exercise.useBodyweight)}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${exercise.useBodyweight ? 'bg-primary-color' : 'bg-slate-600'}`}
                            >
                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${exercise.useBodyweight ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {exercise.useBodyweight && (
                            <p className="text-xs text-slate-500 animate-fade-in">
                                Activado. El peso introducido en las series se considerará "lastre" (peso añadido). Tu peso corporal se sumará para calcular el volumen total.
                            </p>
                        )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                        <select
                            value={exercise.trainingMode || 'reps'}
                            onChange={(e) => onExerciseChange(exIndex, 'trainingMode', e.target.value)}
                            className="flex-1 bg-slate-800 p-2 rounded-lg text-sm"
                        >
                            <option value="reps">Repeticiones</option>
                            <option value="time">Tiempo</option>
                            <option value="percent">%1RM</option>
                            <option value="distance">Distancia</option>
                            <option value="custom">Personalizado</option>
                        </select>
                        {exercise.trainingMode === 'custom' && (
                            <input
                                type="text"
                                value={exercise.customUnit || ''}
                                onChange={(e) => onExerciseChange(exIndex, 'customUnit', e.target.value)}
                                placeholder="Unidad (ej: vueltas)"
                                className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm"
                            />
                        )}
                    </div>

                  {isPotentiallyUnilateral && (
                    <div className="bg-slate-900/50 p-3 rounded-lg animate-fade-in space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor={`unilateral-toggle-${exercise.id}`} className="block text-sm font-medium text-slate-300">
                                Modo Unilateral
                            </label>
                            <button
                                id={`unilateral-toggle-${exercise.id}`}
                                type="button"
                                onClick={() => onExerciseChange(exIndex, 'isUnilateral', !exercise.isUnilateral)}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${exercise.isUnilateral ? 'bg-primary-color' : 'bg-slate-600'}`}
                            >
                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${exercise.isUnilateral ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {exercise.isUnilateral && (
                             <div className="animate-fade-in">
                                <label htmlFor={`unilateral-rest-${exercise.id}`} className="block text-xs font-medium text-slate-400">Descanso entre lados (s)</label>
                                <input
                                    type="number"
                                    id={`unilateral-rest-${exercise.id}`}
                                    value={exercise.unilateralRestTime || ''}
                                    onChange={(e) => onExerciseChange(exIndex, 'unilateralRestTime', parseInt(e.target.value) || undefined)}
                                    placeholder="Ej: 15"
                                    className="w-24 mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-base"
                                />
                            </div>
                        )}
                    </div>
                  )}

                  {trainingMode === 'reps' && (
                    <div className="animate-fade-in text-right">
                        <Button
                            type="button"
                            onClick={() => setIsProgressionModalOpen(true)}
                            variant="secondary"
                            className="!text-xs !bg-sky-900/50 !text-sky-300"
                        >
                           Pesos de Progresión
                        </Button>
                    </div>
                  )}

                  {trainingMode === 'percent' && (
                    <div className="animate-fade-in">
                      {!exercise.calculated1RM ? (
                        <RMCalculator settings={settings} on1RMSet={(value) => onExerciseChange(exIndex, 'calculated1RM', value)} />
                      ) : (
                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                            <span className="text-sm text-slate-300">1RM de Trabajo: <span className="font-bold text-lg text-white">{exercise.calculated1RM} {settings.weightUnit}</span></span>
                            <Button onClick={() => onExerciseChange(exIndex, 'calculated1RM', undefined)} variant="secondary" className="!text-xs !py-1 !px-2">Editar</Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div>
                          <label className="block text-xs font-medium text-slate-400">Descanso (s)</label>
                          <input type="number" step="5" value={exercise.restTime || ''} onChange={(e) => onExerciseChange(exIndex, 'restTime', parseInt(e.target.value, 10) || 0)} className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-base" />
                      </div>
                      {exercise.isSupersetStart && (
                          <div className="animate-fade-in">
                              <label className="block text-xs font-medium text-slate-400">Descanso Biserie (s)</label>
                              <input type="number" step="5" value={exercise.supersetRest || ''} onChange={(e) => onExerciseChange(exIndex, 'supersetRest', parseInt(e.target.value, 10) || 0)} placeholder="15" className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-base" />
                          </div>
                      )}
                      {exercise.isFavorite && (
                          <div>
                              <label className="block text-xs font-medium text-slate-400 flex items-center gap-1"><TrophyIcon size={12}/> Meta 1RM ({settings.weightUnit})</label>
                              <input type="number" step="1" value={exercise.goal1RM || ''} onChange={(e) => onExerciseChange(exIndex, 'goal1RM', parseInt(e.target.value, 10) || undefined)} className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-base" />
                          </div>
                      )}
                      <div className="flex items-center gap-2 pt-4">
                        <button type="button" title="Marcar para seguimiento de Meta 1RM" onClick={() => onExerciseChange(exIndex, 'isFavorite', !exercise.isFavorite)}><StarIcon filled={exercise.isFavorite} className={exercise.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}/></button>
                        {exIndex < totalExercises - 1 && <button type="button" title="Biserie con el siguiente" onClick={() => onExerciseChange(exIndex, 'isSupersetStart', !exercise.isSupersetStart)}><LinkIcon className={exercise.isSupersetStart ? 'text-primary-color' : 'text-slate-500 hover:text-primary-color'}/></button>}
                        <button type="button" onClick={() => onRemoveExercise(exIndex)} className="p-1 rounded-full text-slate-400 hover:bg-red-500 hover:text-white transition"><TrashIcon /></button>
                      </div>
                  </div>
                    <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
                        <div className="min-w-[600px] space-y-2">
                             <div className="grid grid-cols-12 gap-x-2 text-xs text-slate-400 px-2 font-semibold">
                                <span className="col-span-1 text-center">#</span>
                                <span className="col-span-3 text-center">Objetivo</span>
                                <span className="col-span-4 text-center">Intensidad</span>
                                <span className="col-span-2 text-center">Carga Calc.</span>
                                <span className="col-span-1 text-center">Téc.</span>
                                <span className="col-span-1"></span>
                            </div>
                          {exercise.sets.map((set, setIndex) => {
                              const calculatedWeight = exercise.trainingMode === 'percent' && exercise.calculated1RM && set.targetPercentageRM ? roundWeight(exercise.calculated1RM * (set.targetPercentageRM / 100), settings.weightUnit) : null;
                              return (
                                <React.Fragment key={set.id}>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <span className="col-span-1 font-bold text-lg text-center text-slate-500">{setIndex + 1}</span>
                                        <div className="col-span-3">{renderTargetInput(set, setIndex)}</div>
                                        <div className="col-span-4 flex items-center gap-2">
                                            <select value={set.intensityMode || 'approx'} onChange={(e) => onSetChange(exIndex, setIndex, 'intensityMode', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-1 text-center text-xs h-full">
                                                <option value="approx">Aprox</option><option value="rpe">RPE</option><option value="rir">RIR</option><option value="failure">Fallo</option>
                                            </select>
                                            <div className="flex-grow">
                                                {set.intensityMode === 'rpe' && <input type="number" step="0.5" value={set.targetRPE ?? ''} onChange={(e) => onSetChange(exIndex, setIndex, 'targetRPE', e.target.value)} placeholder="RPE" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-center" />}
                                                {set.intensityMode === 'rir' && <input type="number" value={set.targetRIR ?? ''} onChange={(e) => onSetChange(exIndex, setIndex, 'targetRIR', e.target.value)} placeholder="RIR" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-center" />}
                                                {(set.intensityMode === 'failure' || set.intensityMode === 'approx' || !set.intensityMode) && <div className="h-full flex items-center justify-center text-slate-600 text-xs italic px-2">{set.intensityMode === 'failure' ? <ZapIcon size={14} className="text-red-500" /> : 'N/A'}</div>}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            {calculatedWeight !== null ? (
                                                <div className="bg-slate-950/50 p-1 rounded-lg h-full flex flex-col justify-center">
                                                    <div className="font-bold text-white text-sm">{calculatedWeight} {settings.weightUnit}</div>
                                                </div>
                                            ) : <span className="text-slate-600 flex items-center justify-center h-full">-</span>}
                                        </div>
                                        <div className="col-span-1">
                                            <select value={set.advancedTechnique || ''} onChange={e => onSetChange(exIndex, setIndex, 'advancedTechnique', e.target.value as any)} className="w-full bg-slate-700 border-slate-600 rounded-lg p-1 text-center text-xs h-full">
                                                <option value="">Normal</option><option value="dropset">Drop</option><option value="rest-pause">Rest-P</option><option value="cluster">Cluster</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            {exercise.sets.length > 1 && <button type="button" onClick={() => onRemoveSet(exIndex, setIndex)} className="p-1 rounded text-slate-400 hover:bg-red-500 hover:text-white transition"><XIcon size={16} /></button>}
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-start-2 col-span-11">
                                            <input
                                                type="text"
                                                value={set.notes || ''}
                                                onChange={e => onSetChange(exIndex, setIndex, 'notes', e.target.value)}
                                                placeholder="Añadir variación técnica o notas... (ej: con pausa de 2s)"
                                                className="w-full bg-slate-800 border-slate-700 rounded p-1 text-xs"
                                            />
                                        </div>
                                    </div>
                                </React.Fragment>
                              )
                          })}
                        </div>
                    </div>
                  <button type="button" onClick={() => onAddSet(exIndex)} className="mt-3 text-sm flex items-center gap-1 text-primary-color hover:text-primary-color-light"><PlusIcon size={16}/> Añadir Serie</button>
                  <div className="mt-4">
                      <label htmlFor={`notes-${exercise.id}`} className="block text-xs font-medium text-slate-400 mb-1">Notas del Ejercicio</label>
                      <textarea id={`notes-${exercise.id}`} value={exercise.notes || ''} onChange={(e) => onExerciseChange(exIndex, 'notes', e.target.value)} placeholder="Ej: Enfocarse en la fase excéntrica..." rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  {showBrandHomologation && (
                    <details className="mt-4 text-sm animate-fade-in">
                        <summary className="cursor-pointer text-slate-400 font-semibold">Marcas y Homologación</summary>
                        <div className="p-3 mt-2 bg-slate-950/50 rounded-lg border border-slate-700 space-y-3">
                            {(exercise.brandEquivalencies || []).map((brand, index) => (
                                <div key={index} className="flex items-center justify-between text-xs bg-slate-800/50 p-2 rounded">
                                    <span><span className="font-bold">{brand.brand}</span>: Ratio {brand.ratio}x</span>
                                    <button type="button" onClick={() => handleRemoveBrand(index)}>
                                        <TrashIcon size={14} className="text-slate-500 hover:text-red-500"/>
                                    </button>
                                </div>
                            ))}
                            <BrandHomologationEditor
                                onAdd={(newBrand) => {
                                    const updatedBrands = [...(exercise.brandEquivalencies || []), newBrand];
                                    onExerciseChange(exIndex, 'brandEquivalencies', updatedBrands);
                                }}
                            />
                        </div>
                    </details>
                  )}
                   <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                        <JokerExerciseEditor exercise={exercise} onJokerNameChange={(name) => onExerciseChange(exIndex, 'jokerExerciseName', name)} />
                    </div>
                   <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-3">
                        <h4 className="text-md font-semibold text-white flex items-center gap-2"><TrophyIcon size={16}/> Pruebas de 1RM</h4>
                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                            <label htmlFor={`periodic-test-${exercise.id}`} className="block text-sm font-medium text-slate-300">
                                Test RM periódico
                            </label>
                             <button
                                id={`periodic-test-${exercise.id}`}
                                type="button"
                                onClick={() => onExerciseChange(exIndex, 'periodic1RMTestEnabled', !exercise.periodic1RMTestEnabled)}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${exercise.periodic1RMTestEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}
                            >
                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${exercise.periodic1RMTestEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {exercise.periodic1RMTestEnabled && (
                            <div className="pl-4 space-y-2 animate-fade-in">
                                <label htmlFor={`freq-${exercise.id}`} className="block text-xs font-medium text-slate-400">Frecuencia (semanas)</label>
                                <input 
                                    id={`freq-${exercise.id}`}
                                    type="number" 
                                    value={exercise.periodic1RMTestFrequency || ''} 
                                    onChange={(e) => onExerciseChange(exIndex, 'periodic1RMTestFrequency', parseInt(e.target.value, 10) || undefined)} 
                                    className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-base"
                                    placeholder="4"
                                />
                                <p className="text-xs text-slate-500">Recomendado: 4-8 semanas.</p>
                            </div>
                        )}
                    </div>
              </div>
          </div>
        </div>
    </details>
  )
};

const PeriodizationGuide: React.FC = () => (
    <details className="glass-card p-0 overflow-hidden">
        <summary className="p-4 cursor-pointer flex justify-between items-center list-none">
            <h3 className="text-xl font-bold text-white flex items-center gap-3"><BrainIcon /> Guía de Periodización</h3>
            <ChevronRightIcon className="details-arrow transition-transform" />
        </summary>
        <div className="p-4 border-t border-slate-700/50 space-y-4 text-sm text-slate-300">
            <p>La periodización es la planificación a largo plazo del entrenamiento. En lugar de hacer siempre lo mismo, se organiza en bloques con objetivos específicos.</p>
            
            <div>
                <h4 className="font-bold text-white">1. Periodización por Bloques (Tradicional)</h4>
                <p className="text-xs text-slate-400">La que usas al crear un programa aquí.</p>
                <ul className="list-disc list-inside space-y-1 mt-1 pl-2">
                    <li><strong>Macrociclo:</strong> El plan completo, usualmente de meses o un año (Ej: "Preparación para Verano").</li>
                    <li><strong>Mesociclo:</strong> Un bloque de 2 a 6 semanas con un objetivo concreto (Ej: "Bloque de Hipertrofia").</li>
                    <li><strong>Microciclo:</strong> Tu semana de entrenamiento.</li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-white">2. Periodización Ondulante Diaria (DUP)</h4>
                <p className="text-xs text-slate-400">Varía el estímulo dentro de la misma semana.</p>
                 <p className="mt-1">Es una estrategia muy efectiva. En lugar de hacer 4 semanas de hipertrofia y luego 4 de fuerza, combinas los estímulos en la misma semana. Esto se puede configurar en tus sesiones.</p>
                 <p className="mt-1 text-slate-400 italic"><strong>Ejemplo:</strong> Lunes (Fuerza): 5x5, Miércoles (Hipertrofia): 4x10, Viernes (Potencia): 6x3.</p>
            </div>

            <div>
                <h4 className="font-bold text-white">3. Periodización Intra-Sesión</h4>
                 <p className="text-xs text-slate-400">Variaciones dentro del mismo entrenamiento.</p>
                 <p className="mt-1">Incluso en una sola sesión, puedes periodizar. Esto se hace ajustando las series de un ejercicio.</p>
                 <p className="mt-1 text-slate-400 italic"><strong>Ejemplo (Top Set / Back-off Sets):</strong> En Press de Banca, haces una serie pesada de 3-5 reps (Top Set), y luego bajas el peso y haces 3 series más ligeras de 8-10 reps (Back-off Sets) para acumular volumen.</p>
            </div>
             <div>
                <h4 className="font-bold text-white">4. Progresión Lineal Simple</h4>
                 <p className="text-xs text-slate-400">El punto de partida más común.</p>
                 <p className="mt-1">Consiste simplemente en intentar añadir más peso o más repeticiones a tus ejercicios en cada sesión. Es muy efectivo para principiantes, pero con el tiempo puede llevar a estancamientos. La periodización ayuda a romper esas barreras.</p>
            </div>
        </div>
    </details>
);


const SessionEditor: React.FC<SessionEditorProps> = ({ onSave, onCancel, existingSessionInfo, isOnline, settings, saveTrigger, addExerciseTrigger, exerciseList }) => {
  const { settings: appSettings, setIsDirty, isDirty: isAppContextDirty, addToast, muscleHierarchy } = useAppContext();
  const [session, setSession] = useState<Session>({ id: '', name: '', description: '', exercises: [], warmup: [] });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWarmup, setIsLoadingWarmup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<{ index: number; query: string } | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string>('Todos');
  const [autoCalculatedFields, setAutoCalculatedFields] = useState(new Set<string>());
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [infoModalExercise, setInfoModalExercise] = useState<ExerciseMuscleInfo | null>(null);
  const [macroParams, setMacroParams] = useState<MacroParameters>({});

  const initializedSessionKey = useRef<string | null>(null);

  useEffect(() => {
    if (existingSessionInfo) {
      const initializeEditor = async () => {
        let initialData = JSON.parse(JSON.stringify(existingSessionInfo.session));
        setIsDirty(false);
  
        const draft = await storageService.get<{ session: Session; programId: string; associatedId: string | null }>(SESSION_DRAFT_KEY);
        if (draft) {
          const draftAssociatedId = draft.associatedId;
          const currentId = existingSessionInfo.session.id;
  
          if (draftAssociatedId === currentId) {
            if (window.confirm('Se encontró un borrador de sesión no guardado. ¿Deseas restaurarlo?')) {
              initialData = draft.session;
              setIsDirty(true);
            } else {
              await storageService.remove(SESSION_DRAFT_KEY);
            }
          }
        }
        setSession(initialData);
        setEditingMode('A');
      };
  
      initializeEditor();
    }
// FIX: Changed dependency from `existingSessionInfo?.sessionId` to `existingSessionInfo?.session.id` because `sessionId` does not exist on the prop.
  }, [existingSessionInfo?.programId, existingSessionInfo?.weekId, existingSessionInfo?.session.id, setIsDirty]);

    const handleSessionInfoChange = (field: keyof Omit<Session, 'id' | 'exercises' | 'warmup' | 'background' | 'sessionB' | 'sessionC' | 'sessionD' | 'nameA' | 'lastScore' | 'parts'>, value: any) => {
        setSession(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

     const handleSubNameChange = (subName: string) => {
        setSession(prev => {
            const newSession = {...prev};
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            if (editingMode === 'A') {
                newSession.nameA = subName;
            } else if (editingMode === 'B' || editingMode === 'C' || editingMode === 'D') {
                 if (!newSession[modeKey]) newSession[modeKey] = { exercises: [] };
                 (newSession[modeKey] as any).name = subName;
            }
            return newSession;
        });
        setIsDirty(true);
    };

    const handleWarmupChange = (index: number, field: keyof WarmupStep, value: any) => {
        setSession(prev => {
            const newWarmup = [...(prev.warmup || [])];
            newWarmup[index] = { ...newWarmup[index], [field]: value };
            return { ...prev, warmup: newWarmup };
        });
        setIsDirty(true);
    }

    const handleAddWarmupStep = () => {
        setSession(prev => {
            const newWarmup = [...(prev.warmup || [])];
            newWarmup.push({ id: crypto.randomUUID(), name: '', sets: 1, reps: '10' });
            return { ...prev, warmup: newWarmup };
        });
        setIsDirty(true);
    }

    const handleRemoveWarmupStep = (index: number) => {
        setSession(prev => {
            const newWarmup = [...(prev.warmup || [])].filter((_, i) => i !== index);
            return { ...prev, warmup: newWarmup };
        });
        setIsDirty(true);
    }

    const handleGenerate = async () => {
        if (!aiPrompt || !isOnline) return;
        setIsLoading(true);
        setError(null);
        try {
            const generated = await generateSession(aiPrompt, appSettings);
            const newExercises = generated.exercises.map(ex => ({
                ...ex,
                id: crypto.randomUUID(),
                isFavorite: false,
                trainingMode: 'reps' as const,
                sets: ex.sets.map(set => ({...set, id: crypto.randomUUID()}))
            }));
            
            setSession(prev => {
                const newSession = {...prev, name: generated.name, description: generated.description};
                const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
                if (editingMode === 'A') {
                    newSession.exercises = newExercises;
                } else {
                    if (!newSession[modeKey]) newSession[modeKey] = { exercises: [] };
                    (newSession[modeKey] as any).exercises = newExercises;
                }
                return newSession;
            });
            setIsDirty(true);

        } catch (err: any) {
            setError(err.message || "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateWarmup = async () => {
        if (!isOnline || session.exercises.length === 0) return;
        setIsLoadingWarmup(true);
        try {
            const generatedWarmup = await generateWarmupForSession(session as Session, appSettings);
            const warmupWithIds = generatedWarmup.map(step => ({ ...step, id: crypto.randomUUID() }));
            setSession(prev => ({ ...prev, warmup: warmupWithIds }));
            setIsDirty(true);
        } catch (err: any) {
            console.error("Error generando calentamiento", err);
        } finally {
            setIsLoadingWarmup(false);
        }
    }

    const handleSaveSession = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!existingSessionInfo) return;
        if (!session.name.trim()) {
            alert('El nombre de la sesión es obligatorio.');
            return;
        }
        const finalSession: Session = {
            ...session,
            id: session.id || crypto.randomUUID(),
        };
        onSave(finalSession, existingSessionInfo.programId, existingSessionInfo.macroIndex, existingSessionInfo.mesoIndex, existingSessionInfo.weekId);
        storageService.remove(SESSION_DRAFT_KEY);
    };
    
    useEffect(() => {
        const prevSaveTrigger = saveTrigger - 1;
        if (saveTrigger > 0 && saveTrigger > prevSaveTrigger) {
            handleSaveSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveTrigger]);
    
     const handleAddExercise = useCallback(() => {
        const newExercise: Exercise = {
            id: crypto.randomUUID(),
            name: '',
            restTime: macroParams.restTime ?? 90,
            sets: [],
            isFavorite: false,
            trainingMode: 'reps',
            isSupersetStart: false,
            isUnilateral: false,
        };

        const setsCount = macroParams.setsCount || 1;
        for (let i = 0; i < setsCount; i++) {
            newExercise.sets.push({
                id: crypto.randomUUID(),
                targetReps: macroParams.targetReps ?? 8,
                intensityMode: macroParams.intensityMode ?? 'approx',
                targetRPE: macroParams.targetRPE,
                targetRIR: macroParams.targetRIR,
            });
        }

        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            if (editingMode === 'A') {
                newSession.exercises.push(newExercise);
            } else {
                if (!newSession[modeKey]) newSession[modeKey] = { exercises: [] };
                (newSession[modeKey] as any).exercises.push(newExercise);
            }
            return newSession;
        });
        setIsDirty(true);
    }, [editingMode, setIsDirty, macroParams]);
    
    useEffect(() => {
        const prevAddTrigger = addExerciseTrigger - 1;
        if (addExerciseTrigger > 0 && addExerciseTrigger > prevAddTrigger) {
            handleAddExercise();
        }
    }, [addExerciseTrigger, handleAddExercise]);

    const handleExerciseChange = (exIndex: number, field: keyof Exercise, value: any) => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;

            if(!targetArray) return prev;

            targetArray[exIndex] = { ...targetArray[exIndex], [field]: value };
            
             if (field === 'trainingMode') {
                const newAutoFields = new Set(autoCalculatedFields);
                targetArray[exIndex].sets.forEach((set: ExerciseSet, setIndex: number) => {
                    delete set.targetReps;
                    delete set.targetDuration;
                    delete set.targetDistance;
                    delete set.targetCustom;
                    delete set.targetPercentageRM;

                    if (value === 'percent') {
                        const estimatedPercent = estimatePercent1RM(8); // Default to 8 reps
                        targetArray[exIndex].sets[setIndex].targetReps = 8;
                        if (estimatedPercent) {
                            targetArray[exIndex].sets[setIndex].targetPercentageRM = estimatedPercent;
                            newAutoFields.add(`${exIndex}-${setIndex}-targetPercentageRM`);
                        }
                    }
                });
                setAutoCalculatedFields(newAutoFields);
            }
            return newSession;
        });
        setIsDirty(true);
    };

    const handleExerciseNameChange = (index: number, value: string) => {
        handleExerciseChange(index, 'name', value);
        setActiveSuggestion({ index, query: value });
    };
    
    const handleSuggestionClick = (exIndex: number, exerciseName: string) => {
        const newExerciseData = exerciseList.find(exDb => exDb.name.toLowerCase() === exerciseName.toLowerCase());
    
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;
            if (!targetArray) return prev;
    
            const oldExercise = targetArray[exIndex];
            
            // When replacing an exercise, keep its structural properties (like instance ID and set structure)
            // but replace its identity and clear any derived data to prevent stale information.
            targetArray[exIndex] = {
                ...oldExercise,
                name: exerciseName,
                exerciseDbId: newExerciseData?.id, // This is the crucial ID update.
                calculated1RM: undefined, // Clear stale 1RM from the old exercise.
                goal1RM: undefined,
                last1RMTestDate: undefined,
                brandEquivalencies: newExerciseData?.brandEquivalencies || [],
            };
            
            return newSession;
        });
    
        setActiveSuggestion(null);
        setIsDirty(true);
    };
    
    const handleRemoveExercise = (index: number) => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            if (editingMode === 'A') {
                newSession.exercises = newSession.exercises.filter((_: any, i: number) => i !== index);
            } else if (newSession[modeKey]) {
                (newSession[modeKey] as any).exercises = (newSession[modeKey] as any).exercises.filter((_: any, i: number) => i !== index);
            }
            return newSession;
        });
        setIsDirty(true);
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;
            if(!targetArray) return prev;

            const exercise = targetArray[exIndex];
            const newSets = [...exercise.sets];
    
            let processedValue = value;
            if (['targetReps', 'targetDuration', 'targetDistance', 'targetRPE', 'targetRIR', 'targetPercentageRM', 'completedReps', 'weight', 'consolidatedWeight', 'technicalWeight'].includes(field as string)) {
                const numValue = (field === 'targetRPE') ? parseFloat(value) : parseInt(value, 10);
                processedValue = isNaN(numValue) ? undefined : numValue;
            }
    
            const newSet = { ...newSets[setIndex], [field]: processedValue };
    
            if (field === 'intensityMode') {
                if (processedValue === 'rpe') delete newSet.targetRIR;
                else if (processedValue === 'rir') delete newSet.targetRPE;
                else if (processedValue === 'failure' || processedValue === 'approx') {
                    delete newSet.targetRPE;
                    delete newSet.targetRIR;
                }
            }
            
            const shouldRecalculate = exercise.trainingMode === 'percent' && ['targetReps', 'targetRPE', 'targetRIR', 'intensityMode'].includes(field as string);
    
            if (shouldRecalculate) {
                const reps = newSet.targetReps;
                let repsToFailure: number | undefined;
                if (reps !== undefined && reps > 0) {
                    if (newSet.intensityMode === 'failure') repsToFailure = reps;
                    else if (newSet.targetRIR !== undefined && newSet.targetRIR >= 0) repsToFailure = reps + newSet.targetRIR;
                    else if (newSet.targetRPE !== undefined && newSet.targetRPE >= 1 && newSet.targetRPE <= 10) repsToFailure = reps + (10 - newSet.targetRPE);
                    else if (field === 'targetReps') repsToFailure = reps;
                }
                if (repsToFailure !== undefined) {
                    const estimatedPercent = estimatePercent1RM(repsToFailure);
                    if (estimatedPercent !== undefined) {
                        newSet.targetPercentageRM = estimatedPercent;
                        setAutoCalculatedFields(prevSet => new Set(prevSet).add(`${exIndex}-${setIndex}-targetPercentageRM`));
                    } else delete newSet.targetPercentageRM;
                }
            }
            
            if (field === 'targetPercentageRM') {
                const currentAutoCalculated = new Set(autoCalculatedFields);
                currentAutoCalculated.delete(`${exIndex}-${setIndex}-targetPercentageRM`);
                setAutoCalculatedFields(currentAutoCalculated);
            }
    
            newSets[setIndex] = newSet;
            exercise.sets = newSets;
            return newSession;
        });
        setIsDirty(true);
    };
    
    const handleAddSet = (exIndex: number) => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;
            if(!targetArray) return prev;
            const lastSet = targetArray[exIndex].sets[targetArray[exIndex].sets.length - 1] || { targetReps: 8, intensityMode: 'rpe', targetRPE: 7 };
            targetArray[exIndex].sets.push({ ...lastSet, id: crypto.randomUUID() });
            return newSession;
        });
        setIsDirty(true);
    };

    const handleRemoveSet = (exIndex: number, setIndex: number) => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;
            if(!targetArray) return prev;

            if (targetArray[exIndex].sets.length > 1) {
                targetArray[exIndex].sets = targetArray[exIndex].sets.filter((_: any, i: number) => i !== setIndex);
            }
            return newSession;
        });
        setIsDirty(true);
    };
    
    const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
        setSession(prev => {
            const newSession = JSON.parse(JSON.stringify(prev));
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;
            if(!targetArray) return prev;

            const item = targetArray[index];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= targetArray.length) return prev;
            targetArray.splice(index, 1);
            targetArray.splice(newIndex, 0, item);
            return newSession;
        });
        setIsDirty(true);
    }
    
    const handleCreateSessionVariant = (mode: 'B' | 'C' | 'D') => {
        const modeKey = `session${mode}` as 'sessionB' | 'sessionC' | 'sessionD';
        setSession(prev => ({ ...prev, [modeKey]: { exercises: JSON.parse(JSON.stringify(prev.exercises)) } }));
        setIsDirty(true);
    };

    const handleDeleteSessionVariant = (mode: 'B' | 'C' | 'D') => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la Sesión ${mode}?`)) {
             setSession(prev => {
                const { [(`session${mode}` as 'sessionB' | 'sessionC' | 'sessionD')]: _, ...rest } = prev;
                if (editingMode === mode) {
                    setEditingMode('A');
                }
                return rest;
            });
            setIsDirty(true);
        }
    };
    
    const handleCopyFromA = () => {
        if (editingMode === 'A' || !session.exercises) return;
    
        const exercisesFromA = JSON.parse(JSON.stringify(session.exercises)); // Deep copy
        exercisesFromA.forEach((ex: Exercise) => {
            ex.id = crypto.randomUUID();
            ex.sets.forEach((set: ExerciseSet) => {
                set.id = crypto.randomUUID();
            });
        });
    
        setSession(prev => {
            const newSession = {...prev};
            const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
            
            if (!newSession[modeKey]) {
                newSession[modeKey] = { exercises: [] };
            }
            
            (newSession[modeKey] as any).exercises = exercisesFromA;
            return newSession;
        });
        setIsDirty(true);
        addToast(`Ejercicios copiados de Sesión A a Sesión ${editingMode}.`, 'success');
    };

    const handleApplyMacroParams = () => {
        if (Object.keys(macroParams).length === 0) {
            addToast("No has definido ningún parámetro macro para aplicar.", "suggestion");
            return;
        }
        if (window.confirm("Esto sobrescribirá los parámetros de todos los ejercicios existentes en esta sesión. ¿Continuar?")) {
            setSession(prev => {
                const newSession = JSON.parse(JSON.stringify(prev));
                const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
                const targetArray = editingMode === 'A' ? newSession.exercises : (newSession[modeKey] as any)?.exercises;

                if (!targetArray) return prev;

                targetArray.forEach((ex: Exercise) => {
                    if (macroParams.restTime !== undefined) ex.restTime = macroParams.restTime;
                    
                    if (macroParams.setsCount !== undefined) {
                        const currentCount = ex.sets.length;
                        if (macroParams.setsCount > currentCount) {
                            const lastSet = ex.sets[currentCount - 1] || { id: crypto.randomUUID() };
                            for(let i = 0; i < macroParams.setsCount - currentCount; i++) {
                                ex.sets.push({ ...lastSet, id: crypto.randomUUID() });
                            }
                        } else if (macroParams.setsCount < currentCount) {
                            ex.sets = ex.sets.slice(0, macroParams.setsCount);
                        }
                    }

                    ex.sets.forEach((set: ExerciseSet) => {
                        if (macroParams.targetReps !== undefined) set.targetReps = macroParams.targetReps;
                        if (macroParams.intensityMode) {
                            set.intensityMode = macroParams.intensityMode;
                            set.targetRPE = macroParams.intensityMode === 'rpe' ? macroParams.targetRPE : undefined;
                            set.targetRIR = macroParams.intensityMode === 'rir' ? macroParams.targetRIR : undefined;
                        }
                    });
                });
                return newSession;
            });
            setIsDirty(true);
            addToast("Parámetros Macro aplicados a todos los ejercicios.", "success");
        }
    };

    const handleMacroParamChange = <K extends keyof MacroParameters>(key: K, value: MacroParameters[K]) => {
        setMacroParams(prev => ({...prev, [key]: value}));
    }


    const exercisesForMode = useMemo(() => {
        const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
        if (editingMode === 'A') return session.exercises || [];
        return (session[modeKey] as any)?.exercises || [];
    }, [editingMode, session]);

    const currentSubName = useMemo(() => {
        const modeKey = `session${editingMode}` as 'sessionB' | 'sessionC' | 'sessionD';
        if (editingMode === 'A') return session.nameA || '';
        return (session[modeKey] as any)?.name || '';
    }, [editingMode, session]);

    const filteredSuggestions = useCallback((query: string, muscleFilter: string) => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        
        const sourceList = muscleFilter === 'Todos' 
            ? exerciseList 
            : exerciseList.filter(ex => (ex.involvedMuscles || []).some(m => m.role === 'primary' && m.muscle === muscleFilter));

        return sourceList
            .filter(ex => ex.name.toLowerCase().includes(lowerCaseQuery))
            .slice(0, 5);
    }, [exerciseList]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            {infoModalExercise && <ExerciseInfoModal exercise={infoModalExercise} onClose={() => setInfoModalExercise(null)} />}
            {isBgModalOpen && (
                <BackgroundEditorModal
                    isOpen={isBgModalOpen}
                    onClose={() => setIsBgModalOpen(false)}
                    onSave={(bg) => {
                        setSession(s => ({...s, background: bg}));
                        setIsDirty(true);
                    }}
                    initialBackground={session.background}
                    previewTitle={session.name}
                    isOnline={isOnline}
                />
            )}

          <form onSubmit={handleSaveSession}>
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <div>
                     <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                        {existingSessionInfo?.session.name !== 'Nueva Sesión' ? 'Editar Sesión' : 'Crear Nueva Sesión'}
                    </h2>
                    <p className="text-slate-400">Diseña los ejercicios, series y repeticiones.</p>
                </div>
                <Button type="button" onClick={() => setIsBgModalOpen(true)} variant="secondary">
                    <Wand2Icon size={16} /> Personalizar Fondo
                </Button>
            </div>

            <div className="space-y-8">
                {/* Session Details */}
                <div className="glass-card p-4">
                    <div className="space-y-4">
                        <input type="text" value={session.name} onChange={e => handleSessionInfoChange('name', e.target.value)} placeholder="Nombre de la Sesión (Ej: Día de Pecho y Tríceps)" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-bold" />
                        <textarea value={session.description} onChange={e => handleSessionInfoChange('description', e.target.value)} rows={2} placeholder="Descripción o enfoque de la sesión..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm" />
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Día de la semana (opcional)</label>
                            <select
                                value={session.dayOfWeek ?? -1}
                                onChange={e => handleSessionInfoChange('dayOfWeek', e.target.value === "-1" ? undefined : parseInt(e.target.value, 10))}
                                className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-md px-4 py-2"
                            >
                                {['Sin asignar', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                                    <option key={day} value={index === 0 ? -1 : (settings.startWeekOn === 'lunes' ? index : (index % 7))}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                 {/* Macro Parameters */}
                <details className="group glass-card overflow-hidden !p-0">
                    <summary className="p-4 cursor-pointer flex justify-between items-center list-none">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2"><Wand2Icon /> Parámetros Macro de la Sesión</h3>
                        <ChevronRightIcon className="details-arrow transition-transform" />
                    </summary>
                    <div className="p-4 border-t border-slate-700/50 space-y-4">
                        <p className="text-xs text-slate-400">Define valores por defecto para todos los nuevos ejercicios. Puedes aplicarlos a los existentes con el botón de abajo.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><label className="text-sm text-slate-300">Nº de Series</label><input type="number" value={macroParams.setsCount || ''} onChange={e => handleMacroParamChange('setsCount', parseInt(e.target.value) || undefined)} className="w-full mt-1" /></div>
                            <div><label className="text-sm text-slate-300">Reps</label><input type="number" value={macroParams.targetReps || ''} onChange={e => handleMacroParamChange('targetReps', parseInt(e.target.value) || undefined)} className="w-full mt-1" /></div>
                            <div><label className="text-sm text-slate-300">Descanso (s)</label><input type="number" value={macroParams.restTime || ''} onChange={e => handleMacroParamChange('restTime', parseInt(e.target.value) || undefined)} className="w-full mt-1" /></div>
                        </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm text-slate-300">Modo Intensidad</label>
                                <select value={macroParams.intensityMode || 'approx'} onChange={e => handleMacroParamChange('intensityMode', e.target.value as any)} className="w-full mt-1">
                                    <option value="approx">Aprox</option><option value="rpe">RPE</option><option value="rir">RIR</option><option value="failure">Fallo</option>
                                </select>
                            </div>
                            {macroParams.intensityMode === 'rpe' && (
                                <div><label className="text-sm text-slate-300">RPE Objetivo</label><input type="number" step="0.5" value={macroParams.targetRPE || ''} onChange={e => handleMacroParamChange('targetRPE', parseFloat(e.target.value) || undefined)} className="w-full mt-1" /></div>
                            )}
                             {macroParams.intensityMode === 'rir' && (
                                <div><label className="text-sm text-slate-300">RIR Objetivo</label><input type="number" value={macroParams.targetRIR || ''} onChange={e => handleMacroParamChange('targetRIR', parseInt(e.target.value) || undefined)} className="w-full mt-1" /></div>
                            )}
                        </div>
                        <Button type="button" onClick={handleApplyMacroParams} variant="secondary" className="w-full mt-4">Aplicar a Todos los Ejercicios</Button>
                    </div>
                </details>

                 <WorkoutVolumeAnalysis session={session} history={[]} isOnline={isOnline} settings={settings} title="Análisis de Volumen (En Vivo)" />

                {/* AI Generator */}
                <div className="glass-card p-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><SparklesIcon /> Asistente IA</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Ej: 'Sesión de empuje enfocada en hipertrofia'" className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-2" disabled={!isOnline || isLoading} />
                        <Button type="button" onClick={handleGenerate} isLoading={isLoading} disabled={!aiPrompt || !isOnline}><SparklesIcon size={16}/> Generar Sesión</Button>
                    </div>
                    {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                </div>
                
                {/* Warmup Section */}
                <details className="group glass-card overflow-hidden !p-0">
                    <summary className="p-4 cursor-pointer flex justify-between items-center list-none">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2"><FlameIcon /> Calentamiento ({session.warmup?.length || 0} pasos)</h3>
                        <ChevronRightIcon className="details-arrow transition-transform" />
                    </summary>
                    <div className="p-4 border-t border-slate-700/50 space-y-3">
                         <div className="space-y-2">
                            {session.warmup?.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md">
                                    <input type="text" value={step.name} onChange={(e) => handleWarmupChange(index, 'name', e.target.value)} className="bg-transparent flex-grow text-sm" />
                                    <input type="number" value={step.sets} onChange={(e) => handleWarmupChange(index, 'sets', parseInt(e.target.value, 10) || 1)} className="w-12 bg-slate-800 rounded text-center" />
                                    <span className="text-xs">x</span>
                                    <input type="text" value={step.reps} onChange={(e) => handleWarmupChange(index, 'reps', e.target.value)} className="w-16 bg-slate-800 rounded text-center" />
                                    <button onClick={() => handleRemoveWarmupStep(index)}><TrashIcon size={16} className="text-slate-500 hover:text-red-400"/></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" onClick={handleAddWarmupStep} variant="secondary" className="!text-sm !py-1"><PlusIcon size={14}/> Añadir Paso</Button>
                            <Button type="button" onClick={handleGenerateWarmup} variant="secondary" className="!text-sm !py-1" isLoading={isLoadingWarmup} disabled={!isOnline || session.exercises.length === 0}><SparklesIcon size={14}/> Sugerir con IA</Button>
                        </div>
                    </div>
                </details>

                {/* Exercises */}
                 <div className="space-y-6">
                     <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-full text-sm">
                            {['A', 'B', 'C', 'D'].map(mode => {
                                const modeKey = `session${mode}` as 'sessionB' | 'sessionC' | 'sessionD';
                                const exists = mode === 'A' || !!session[modeKey];
                                if (!exists) return null;
                                return (
                                    <button key={mode} type="button" onClick={() => setEditingMode(mode as 'A'|'B'|'C'|'D')} className={`relative px-3 py-1 rounded-full font-semibold transition-colors ${editingMode === mode ? 'bg-primary-color text-white' : 'text-slate-300'}`}>
                                        Sesión {mode}
                                        {mode !== 'A' && (
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSessionVariant(mode as 'B'|'C'|'D'); }} 
                                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-400"
                                                aria-label={`Eliminar Sesión ${mode}`}
                                            >
                                                <XIcon size={10}/>
                                            </button>
                                        )}
                                    </button>
                                );
                            })}
                             {!session.sessionB && <button type="button" onClick={() => handleCreateSessionVariant('B')} className="text-slate-400 hover:text-white px-2">+</button>}
                             {session.sessionB && !session.sessionC && <button type="button" onClick={() => handleCreateSessionVariant('C')} className="text-slate-400 hover:text-white px-2">+</button>}
                             {session.sessionC && !session.sessionD && <button type="button" onClick={() => handleCreateSessionVariant('D')} className="text-slate-400 hover:text-white px-2">+</button>}
                        </div>
                        <div>
                             <label htmlFor="muscle-filter" className="text-sm text-slate-400 mr-2">Filtrar:</label>
                             <select id="muscle-filter" value={muscleFilter} onChange={e => setMuscleFilter(e.target.value)} className="bg-slate-800 border-slate-700 rounded-md p-1.5 text-sm">
                                {MUSCLE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
                             </select>
                        </div>
                    </div>
                    
                    <div className="glass-card-nested p-3">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Sub-nombre de Sesión {editingMode} (opcional)</label>
                        <input type="text" value={currentSubName} onChange={e => handleSubNameChange(e.target.value)} placeholder="Ej: Día Pesado, Enfoque Volumen..." className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-sm" />
                        {editingMode !== 'A' && (
                            <Button type="button" onClick={handleCopyFromA} variant="secondary" className="!text-xs !py-1 mt-2 w-full flex items-center justify-center gap-2">
                                <ClipboardPlusIcon size={14}/> Copiar ejercicios de Sesión A
                            </Button>
                        )}
                    </div>

                    {exercisesForMode.length === 0 && editingMode !== 'A' && session.exercises.length > 0 ? (
                        <div className="text-center py-8 glass-card-nested">
                            <p className="text-slate-400 mb-4">Esta sesión variante está vacía.</p>
                            <Button type="button" onClick={handleCopyFromA}>
                                <PlusIcon /> Copiar Ejercicios de Sesión A
                            </Button>
                        </div>
                    ) : (
                        exercisesForMode.map((ex, index) => (
                            <ExerciseEditor
                                key={ex.id}
                                exercise={ex}
                                exIndex={index}
                                totalExercises={exercisesForMode.length}
                                settings={settings}
                                activeSuggestion={activeSuggestion}
                                autoCalculatedFields={autoCalculatedFields}
                                onExerciseChange={handleExerciseChange}
                                onExerciseNameChange={handleExerciseNameChange}
                                onSuggestionClick={handleSuggestionClick}
                                onRemoveExercise={handleRemoveExercise}
                                onSetChange={handleSetChange}
                                onAddSet={handleAddSet}
                                onRemoveSet={handleRemoveSet}
                                onMoveExercise={handleMoveExercise}
                                muscleFilter={muscleFilter}
                                exerciseList={exerciseList}
                                filteredSuggestions={filteredSuggestions}
                                setInfoModalExercise={setInfoModalExercise}
                            />
                        ))
                    )}
                </div>
                
                {/* Periodization Guide */}
                <PeriodizationGuide />

            </div>
          </form>
        </div>
    );
};
export default SessionEditor;
