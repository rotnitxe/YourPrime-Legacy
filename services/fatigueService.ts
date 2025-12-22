import { ExerciseSet, Session, ExerciseMuscleInfo, CompletedSet, OngoingSetData } from '../types';

export const isSetEffective = (set: ExerciseSet | CompletedSet | OngoingSetData): boolean => { 
    // Lógica simplificada: Si no es inefectiva, cuenta 
    if ('isIneffective' in set && set.isIneffective) return false; 
    return true; 
};

export const calculateCompletedSessionStress = (completedExercises: any[], exerciseList: ExerciseMuscleInfo[]): number => { 
    // Cálculo de estrés base 
    let totalStress = 0; 
    completedExercises.forEach(ex => { 
        totalStress += ex.sets.length * 5; // 5 puntos por serie arbitrarios para iniciar 
    }); 
    return totalStress; 
};

export const calculateSessionStress = (session: Session, exerciseList: ExerciseMuscleInfo[]): number => { 
    let totalStress = 0; 
    const exercises = (session.parts && session.parts.length > 0) ? session.parts.flatMap(p => p.exercises) : session.exercises; 
    exercises.forEach(ex => totalStress += ex.sets.length * 5); 
    return totalStress; 
};

export const calculateStimulusToFatigueRatio = (session: Session, exerciseList: ExerciseMuscleInfo[]): number => 1.5;