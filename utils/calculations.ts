import { Exercise, ExerciseSet, Settings, WorkoutLog, ExerciseMuscleInfo } from '../types';

export const REP_TO_PERCENT_1RM: { [key: number]: number } = { 1: 100, 5: 87, 8: 80, 10: 75, 12: 70, 15: 65 };

export const estimatePercent1RM = (reps: number): number | undefined => { 
    if (reps <= 0) return undefined; 
    if (reps >= 1 && reps <= 15) return REP_TO_PERCENT_1RM[reps] || 75; // Simplificado
    return 60; 
};

export const calculateBrzycki1RM = (weight: number, reps: number): number => { 
    if (reps <= 0 || weight <= 0) return 0; 
    if (reps === 1) return weight; 
    return weight / (1.0278 - 0.0278 * reps); 
};

export const calculateWeightFrom1RM = (e1rm: number, reps: number): number => { 
    if (reps <= 0 || e1rm <= 0) return 0; 
    if (reps === 1) return e1rm; 
    return e1rm * (1.0278 - 0.0278 * reps); 
};

export const roundWeight = (weight: number, unit: 'kg' | 'lbs') => { 
    if (weight <= 0) return 0; 
    const step = unit === 'kg' ? 1.25 : 2.5; 
    return Math.round(weight / step) * step; 
};

export const getRepDebtContextKey = (set: ExerciseSet): string => { 
    return `reps${set.targetReps}-approx`; 
};

export const getEffectiveRepsForRM = (set: ExerciseSet): number | undefined => { 
    const reps = set.targetReps; 
    if (!reps) return undefined; 
    if (set.intensityMode === 'failure') return reps; 
    if (set.intensityMode === 'rpe' && set.targetRPE) return reps + (10 - set.targetRPE); 
    if (set.intensityMode === 'rir' && set.targetRIR !== undefined) return reps + set.targetRIR; 
    return reps; 
};

export const getWeightSuggestionForSet = ( 
    exercise: Exercise, 
    exerciseInfo: ExerciseMuscleInfo | undefined, 
    setIndex: number, 
    completedSetsForExercise: { reps?: number, weight: number, machineBrand?: string }[], 
    settings: Settings, 
    history: WorkoutLog[], 
    selectedTag?: string 
): number | undefined => { 
    const set = exercise.sets[setIndex]; 
    const reference1RM = exerciseInfo?.calculated1RM || exercise.reference1RM; 
    if (reference1RM) { 
        const repsToFailure = getEffectiveRepsForRM(set) || set.targetReps || 8; 
        const weight = calculateWeightFrom1RM(reference1RM, repsToFailure); 
        return roundWeight(weight, settings.weightUnit); 
    } 
    return undefined; 
};

export const formatLargeNumber = (num: number): string => { 
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`; 
    return num.toString(); 
};

export const getWeekId = (date: Date, startWeekOn: number | string): string => { 
    const d = new Date(date.valueOf()); 
    d.setUTCHours(0, 0, 0, 0); 
    const day = d.getUTCDay(); 
    
    // Normalize startWeekOn
    let startWeekNum = 1;
    if (typeof startWeekOn === 'number') startWeekNum = startWeekOn;
    else if (startWeekOn === 'domingo') startWeekNum = 0;

    const diff = d.getUTCDate() - day + (startWeekNum === 1 ? (day === 0 ? -6 : 1) : 0); 
    const weekStart = new Date(d.setUTCDate(diff)); 
    return `${weekStart.getUTCFullYear()}-${weekStart.getUTCMonth() + 1}-${weekStart.getUTCDate()}`; 
};

export const calculateStreak = (history: WorkoutLog[], settings: Settings): { streak: number; thisWeekCount: number } => { 
    return { streak: 0, thisWeekCount: 0 }; // Placeholder simplificado 
};

export const calculateIPFGLPoints = (total: number, bw: number, options: any): number => 0; // Placeholder 
export const calculateFFMI = (h: number, w: number, bf: number) => null; // Placeholder

export const isMachineOrCableExercise = (exercise: Exercise, exerciseList: ExerciseMuscleInfo[]): boolean => {
    // 1. Check the database first for explicit equipment type
    const dbInfo = exerciseList.find(e => 
        (e.id && e.id === exercise.exerciseDbId) || 
        (e.name && e.name.toLowerCase() === exercise.name.toLowerCase())
    );
    if (dbInfo && (dbInfo.equipment === 'Máquina' || dbInfo.equipment === 'Polea')) {
        return true;
    }

    // 2. Fallback to keyword matching on the name
    const nameLower = exercise.name.toLowerCase();
    const keywords = [
        'máquina', 'machine', 'polea', 'cable', 'jalón', 'remo sentado', 'pec deck',
        'extensiones', 'curl femoral', 'chest press', 'shoulder press', 'leg press',
        'hack squat', 'pulldown', 'crossover'
    ];

    return keywords.some(kw => nameLower.includes(kw));
};
