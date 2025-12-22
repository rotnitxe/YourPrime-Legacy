// utils/calculations.ts
import { Exercise, ExerciseSet, Settings, WorkoutLog, ExerciseMuscleInfo } from '../types';

export const REP_TO_PERCENT_1RM: { [key: number]: number } = {
    1: 100, 2: 95, 3: 93, 4: 90, 5: 87, 6: 85, 7: 83, 8: 80, 9: 77, 10: 75,
    11: 73, 12: 70, 13: 68, 14: 67, 15: 65,
};

export const estimatePercent1RM = (reps: number): number | undefined => {
    if (reps <= 0) return undefined;
    if (reps >= 1 && reps <= 15) {
        return REP_TO_PERCENT_1RM[reps];
    }
    // Simple linear interpolation for values between known points could be an improvement
    // but for now, this is fine.
    if (reps > 15 && reps <= 20) return 65;
    if (reps > 20) return 60;
    return undefined;
};

// Invert the map for reverse lookup
export const PERCENT_TO_REP_1RM: { [key: string]: number } = Object.entries(REP_TO_PERCENT_1RM).reduce<Record<string, number>>((acc, [reps, percent]) => {
    acc[String(percent)] = parseInt(reps, 10);
    return acc;
}, {});

export const estimateRepsFromPercent = (percent?: number): string => {
    if (percent === undefined || percent === null) return '';
    if (percent >= 100) return '~1';
    if (percent < 65) return '15+';
    const closestPercent = Object.keys(PERCENT_TO_REP_1RM).reduce((prev, curr) => {
        return (Math.abs(parseInt(curr, 10) - percent) < Math.abs(parseInt(prev, 10) - percent) ? curr : prev);
    });
    return `~${PERCENT_TO_REP_1RM[closestPercent]}`;
};


// Brzycki formula for 1RM estimation
export const calculateBrzycki1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  // Formula is generally not recommended for > 10 reps, but we'll allow it.
  return weight / (1.0278 - 0.0278 * reps);
};

// Reverse Brzycki formula to find weight for a given 1RM and reps
export const calculateWeightFrom1RM = (e1rm: number, reps: number): number => {
  if (reps <= 0 || e1rm <= 0) return 0;
  if (reps === 1) return e1rm;
  return e1rm * (1.0278 - 0.0278 * reps);
};

export const roundWeight = (weight: number, unit: 'kg' | 'lbs') => {
    if (weight <= 0) return 0;
    // Round to the nearest whole number.
    return Math.round(weight);
};

export const isMachineOrCableExercise = (exercise: Exercise, exerciseList: ExerciseMuscleInfo[]): boolean => {
    // 1. Check the database first for explicit equipment type
    const dbInfo = exerciseList.find(e => 
        (e.id && e.id === exercise.exerciseDbId) || 
        (e.name && e.name.toLowerCase() === exercise.name.toLowerCase())
    );
    if (dbInfo && (dbInfo.equipment === 'Máquina' || dbInfo.equipment === 'Polea')) {
        return true;
    }

    // 2. Fallback to keyword matching on the name if equipment type isn't definitive
    const nameLower = exercise.name.toLowerCase();
    const keywords = [
        'máquina', 'machine', 'polea', 'cable', 'jalón', 'remo sentado', 'pec deck',
        'extensiones', 'curl femoral', 'chest press', 'shoulder press', 'leg press',
        'hack squat', 'pulldown', 'crossover'
    ];

    return keywords.some(kw => nameLower.includes(kw));
};

export const getWeightSuggestionForSet = (
    exercise: Exercise,
    // FIX: Added missing exerciseInfo parameter to allow for brand equivalency calculations.
    exerciseInfo: ExerciseMuscleInfo | undefined,
    setIndex: number,
    completedSetsForExercise: { reps: number, weight: number }[],
    dynamicWeights: { consolidated?: number, technical?: number },
    settings: Settings,
    history: WorkoutLog[], // New argument
    currentMachineBrand?: string // New argument
): number | undefined => {
    // 1. Priority: %1RM calculation if applicable
    if (exercise.trainingMode === 'percent' && exerciseInfo?.calculated1RM && exercise.sets[setIndex]?.targetPercentageRM) {
        return roundWeight(exerciseInfo.calculated1RM * (exercise.sets[setIndex].targetPercentageRM! / 100), settings.weightUnit);
    }
    
    // 2. Find the absolute last time this exercise was done from history
    const findLastLog = () => {
        // Iterate backwards through history for efficiency
        for (let i = history.length - 1; i >= 0; i--) {
            const log = history[i];
            const completedEx = log.completedExercises.find(ce => 
                (exercise.exerciseDbId && ce.exerciseDbId === exercise.exerciseDbId) || 
                ce.exerciseName.toLowerCase() === exercise.name.toLowerCase()
            );
            if (completedEx && completedEx.sets.length > 0) {
                // Get the last set of that exercise instance
                const lastSet = completedEx.sets[completedEx.sets.length - 1];
                if (lastSet.weight !== undefined) {
                    return {
                        weight: lastSet.weight,
                        brand: lastSet.machineBrand
                    };
                }
            }
        }
        return null;
    }
    
    const lastLogInfo = findLastLog();
    let lastUsedWeightFromHistory = lastLogInfo?.weight;

    // 3. Adjust historical weight based on brand equivalency if necessary
    if (lastUsedWeightFromHistory !== undefined && exerciseInfo?.brandEquivalencies && exerciseInfo.brandEquivalencies.length > 0) {
        const lastUsedBrand = lastLogInfo?.brand;
        if (currentMachineBrand !== lastUsedBrand) {
            const lastUsedBrandRatio = exerciseInfo.brandEquivalencies.find(b => b.brand === lastUsedBrand)?.ratio || 1.0;
            const currentBrandRatio = exerciseInfo.brandEquivalencies.find(b => b.brand === currentMachineBrand)?.ratio || 1.0;

            if (lastUsedBrandRatio !== currentBrandRatio && lastUsedBrandRatio > 0) {
                const baseEquivalentWeight = lastUsedWeightFromHistory / lastUsedBrandRatio;
                lastUsedWeightFromHistory = baseEquivalentWeight * currentBrandRatio;
            }
        }
    }
    
    // 4. Logic for rep-based training
    if ((exercise.trainingMode || 'reps') === 'reps') {
        const { consolidated, technical } = dynamicWeights;

        // If progression weights are set, they have high priority for the first set
        if (setIndex === 0 && consolidated !== undefined) {
            return consolidated;
        }
        
        // If it's the first set and no consolidated weight, use adjusted historical weight
        if (setIndex === 0) {
            return lastUsedWeightFromHistory;
        }

        const prevSet = completedSetsForExercise[setIndex - 1];
        if (prevSet) {
             // Simple fatigue drop-off from previous set in the *same session*
             return roundWeight(prevSet.weight * 0.95, settings.weightUnit);
        }

        // If previous sets in this session aren't complete, suggest technical or historical
        return technical ?? lastUsedWeightFromHistory;
    }

    // 5. Final fallback for other training modes
    return lastUsedWeightFromHistory;
};

export const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 10000) {
        return `${(num / 1000).toFixed(0)}k`;
    }
     if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString('es-ES');
};

export const getWeekId = (date: Date, startDay: 'lunes' | 'domingo'): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day + (startDay === 'lunes' ? (day === 0 ? -6 : 1) : 0);
    const weekStart = new Date(d.setDate(diff));
    return `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
};

const getPrevWeekId = (weekId: string, startDay: 'lunes' | 'domingo'): string => {
    const [year, month, day] = weekId.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 7);
    return getWeekId(date, startDay);
};

export const calculateStreak = (history: WorkoutLog[], settings: Settings): { streak: number; thisWeekCount: number } => {
    if (!history || history.length === 0) {
        return { streak: 0, thisWeekCount: 0 };
    }

    const { startWeekOn } = settings;
    const weeklyCounts = new Map<string, number>();

    history.forEach(log => {
        const weekId = getWeekId(new Date(log.date), startWeekOn);
        weeklyCounts.set(weekId, (weeklyCounts.get(weekId) || 0) + 1);
    });

    const todayWeekId = getWeekId(new Date(), startWeekOn);
    const thisWeekCount = weeklyCounts.get(todayWeekId) || 0;
    
    let streak = 0;
    let currentWeekToCheck = todayWeekId;

    if (thisWeekCount >= 3) {
        streak = 1;
        // FIX: Replaced undefined variable 'startDay' with 'startWeekOn' from settings.
        currentWeekToCheck = getPrevWeekId(currentWeekToCheck, startWeekOn);
        while ((weeklyCounts.get(currentWeekToCheck) || 0) >= 3) {
            streak++;
            // FIX: Replaced undefined variable 'startDay' with 'startWeekOn' from settings.
            currentWeekToCheck = getPrevWeekId(currentWeekToCheck, startWeekOn);
        }
    } else {
        // FIX: Replaced undefined variable 'startDay' with 'startWeekOn' from settings.
        currentWeekToCheck = getPrevWeekId(todayWeekId, startWeekOn);
        while ((weeklyCounts.get(currentWeekToCheck) || 0) >= 3) {
            streak++;
            // FIX: Replaced undefined variable 'startDay' with 'startWeekOn' from settings.
            currentWeekToCheck = getPrevWeekId(currentWeekToCheck, startWeekOn);
        }
    }
    
    return { streak, thisWeekCount };
};

export const getRepDebtContextKey = (set: ExerciseSet): string => {
    let intensity = '';
    if (set.intensityMode === 'failure') intensity = 'failure';
    else if (set.intensityMode === 'rpe' && set.targetRPE) intensity = `rpe${set.targetRPE}`;
    else if (set.intensityMode === 'rir' && set.targetRIR) intensity = `rir${set.targetRIR}`;
    else intensity = 'approx';

    return `reps${set.targetReps}-${intensity}`;
}
