import { WorkoutLog, ExerciseMuscleInfo, SleepLog } from '../types';

export const calculateSystemicFatigue = (history: WorkoutLog[], exerciseList: ExerciseMuscleInfo[], sleepLogs: SleepLog[]) => {
    return { score: 85, status: 'Recuperando', impactFactors: [] };
};

export const calculateMuscleBattery = (muscleName: string, history: WorkoutLog[], exerciseList: ExerciseMuscleInfo[], sleepLogs: SleepLog[], feedbacks: any[], hierarchy: any) => {
    return {
        muscleId: muscleName, muscleName, hoursSinceLastSession: 48, recoveryScore: 100, status: 'fresh',
        impactingFactors: [], effectiveSets: 0, indirectSets: 0, recentTonnage: 0,
        estimatedHoursToRecovery: 0, recoveryRateModifier: 1.0, avgIntensity: null
    };
};

export const checkPendingSurveys = () => [];