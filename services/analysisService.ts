// services/analysisService.ts
import { Program, DetailedMuscleVolumeAnalysis, ExerciseMuscleInfo, Settings, Session, MuscleHierarchy, Exercise, WorkoutLog } from '../types';
import { storageService } from './storageService';
import { analyzeExerciseMuscles } from './aiService';
import { calculateBrzycki1RM } from '../utils/calculations';

const AI_EXERCISE_CACHE_KEY = 'ai-exercise-muscle-info-cache';

const createChildToParentMap = (hierarchy: MuscleHierarchy): Map<string, string> => {
    const map = new Map<string, string>();
    // Iterate over body parts (like 'Brazos', 'Piernas')
    Object.values(hierarchy.bodyPartHierarchy).flat().forEach(group => {
        // Check if the group is an object defining a parent-child relationship
        if (typeof group === 'object' && group !== null) {
            const parent = Object.keys(group)[0];
            const children = Object.values(group)[0];
            children.forEach(child => map.set(child, parent));
        }
    });
    return map;
};


export const calculateSessionVolume = (session: Session, exerciseList: ExerciseMuscleInfo[], muscleHierarchy: MuscleHierarchy): DetailedMuscleVolumeAnalysis[] => {
    const volumeByMuscle: { 
        [key: string]: { 
            directSets: number;
            indirectExercisesData: { sets: number, activation: number }[];
            directExercises: Map<string, number>;
            indirectExercises: Map<string, { sets: number, activation: number }>;
            trainingDays: Set<number>;
        } 
    } = {};

    session.exercises.forEach(exercise => {
        const exerciseData = exerciseList.find(e => e.id === exercise.exerciseDbId || e.name.toLowerCase() === exercise.name.toLowerCase());
        if (!exerciseData || !exerciseData.involvedMuscles) return;

        const totalSets = exercise.sets.length;
        
        exerciseData.involvedMuscles.forEach(muscleInfo => {
            const currentMuscle = muscleInfo.muscle;
            if (!volumeByMuscle[currentMuscle]) {
                volumeByMuscle[currentMuscle] = { directSets: 0, indirectExercisesData: [], directExercises: new Map(), indirectExercises: new Map(), trainingDays: new Set() };
            }

            if (muscleInfo.role === 'primary') {
                volumeByMuscle[currentMuscle].directSets += totalSets;
                volumeByMuscle[currentMuscle].directExercises.set(exercise.name, (volumeByMuscle[currentMuscle].directExercises.get(exercise.name) || 0) + totalSets);
            } else {
                const activationPercentage = muscleInfo.activation * 100;
                volumeByMuscle[currentMuscle].indirectExercisesData.push({ sets: totalSets, activation: muscleInfo.activation });
                volumeByMuscle[currentMuscle].indirectExercises.set(exercise.name, { sets: totalSets, activation: activationPercentage });
            }
            
            if (session.dayOfWeek !== undefined) {
                volumeByMuscle[currentMuscle].trainingDays.add(session.dayOfWeek);
            }
        });
    });

    const childToParentMap = createChildToParentMap(muscleHierarchy);
    const aggregatedVolume: typeof volumeByMuscle = {};

    Object.entries(volumeByMuscle).forEach(([muscleName, data]) => {
        const parentMuscle = childToParentMap.get(muscleName) || muscleName;
        
        if (!aggregatedVolume[parentMuscle]) {
            aggregatedVolume[parentMuscle] = {
                directSets: 0,
                indirectExercisesData: [],
                directExercises: new Map(),
                indirectExercises: new Map(),
                trainingDays: new Set()
            };
        }
        
        const target = aggregatedVolume[parentMuscle];
        
        target.directSets += data.directSets;
        target.indirectExercisesData.push(...data.indirectExercisesData);
        
        data.directExercises.forEach((sets, name) => {
            target.directExercises.set(name, (target.directExercises.get(name) || 0) + sets);
        });
        
        data.indirectExercises.forEach((info, name) => {
            if (!target.directExercises.has(name)) { // Don't add if already a direct exercise for the parent group
                const existing = target.indirectExercises.get(name);
                // Keep the one with higher activation if duplicated
                if (!existing || info.activation > existing.activation) {
                    target.indirectExercises.set(name, info);
                }
            }
        });
        
        data.trainingDays.forEach(day => target.trainingDays.add(day));
    });
    
    return Object.entries(aggregatedVolume).map(([muscleGroup, data]) => {
        const weightedIndirectVolume = data.indirectExercisesData.reduce((total, ex) => total + (ex.sets * ex.activation), 0);
        const totalIndirectSets = Array.from(data.indirectExercises.values()).reduce((sum, item) => sum + item.sets, 0);
        return {
            muscleGroup,
            displayVolume: Math.round(data.directSets + weightedIndirectVolume),
            totalSets: Math.round(data.directSets + totalIndirectSets),
            frequency: 1, // It's always 1 for a single session
            avgRestDays: null,
            directExercises: Array.from(data.directExercises.entries()).map(([name, sets]) => ({ name, sets })),
            indirectExercises: Array.from(data.indirectExercises.entries()).map(([name, { sets, activation }]) => ({ name, sets, activationPercentage: activation })),
            avgIFI: null,
            recoveryStatus: 'N/A' as const,
        };
    }).filter(item => item.displayVolume > 0);
};


export const calculateDetailedVolumeForAllPrograms = async (programs: Program[], settings: Settings, exerciseList: ExerciseMuscleInfo[], muscleHierarchy: MuscleHierarchy): Promise<DetailedMuscleVolumeAnalysis[]> => {
    const aiCache = await storageService.get<Record<string, ExerciseMuscleInfo>>(AI_EXERCISE_CACHE_KEY) || {};
    let cacheWasUpdated = false;

    const combinedExerciseList: Record<string, ExerciseMuscleInfo> = {};
    exerciseList.forEach(ex => combinedExerciseList[ex.name.toLowerCase()] = ex);
    Object.values(aiCache).forEach(ex => {
        if (!combinedExerciseList[ex.name.toLowerCase()]) {
            combinedExerciseList[ex.name.toLowerCase()] = ex;
        }
    });

    const allSessions = programs.flatMap(p => p.macrocycles.flatMap(m => m.mesocycles.flatMap(meso => meso.weeks.flatMap(w => w.sessions))));
    const uniqueExerciseNames = [...new Set(allSessions.flatMap(s => s.exercises.map(e => e.name)))];
    
    const exercisesToFetch = uniqueExerciseNames.filter(name => name && !combinedExerciseList[name.toLowerCase()]);

    if (exercisesToFetch.length > 0) {
        console.log(`Fetching muscle data for ${exercisesToFetch.length} new exercises...`);
        const fetchPromises = exercisesToFetch.map(name => 
            analyzeExerciseMuscles(name, settings).then(muscleInfo => {
                const newExerciseInfo: ExerciseMuscleInfo = {
                    id: `ai_${crypto.randomUUID()}`,
                    name: name,
                    description: `Información de '${name}' generada por IA.`,
                    involvedMuscles: muscleInfo.involvedMuscles,
                    category: 'Hipertrofia',
                    type: 'Accesorio',
                    equipment: 'Otro',
                    force: 'Otro',
                    isCustom: true,
                };
                return newExerciseInfo;
            })
        );

        const newExerciseInfos = await Promise.all(fetchPromises);
        
        newExerciseInfos.forEach(info => {
            if (info.involvedMuscles && info.involvedMuscles.some(m => m.role === 'primary')) {
                const lowerCaseName = info.name.toLowerCase();
                combinedExerciseList[lowerCaseName] = info;
                aiCache[lowerCaseName] = info;
                cacheWasUpdated = true;
            }
        });
    }

    if (cacheWasUpdated) {
        await storageService.set(AI_EXERCISE_CACHE_KEY, aiCache);
        console.log("AI exercise cache updated with new entries.");
    }

    const volumeByMuscle: { 
        [key: string]: { 
            directSets: number;
            indirectExercisesData: { sets: number, activation: number }[];
            directExercises: Map<string, number>;
            indirectExercises: Map<string, { sets: number, activation: number }>;
            trainingDays: Set<number>;
        } 
    } = {};

    allSessions.forEach(session => {
        session.exercises.forEach(exercise => {
            const exerciseData = combinedExerciseList[exercise.name.toLowerCase()];
            if (!exerciseData || !exerciseData.involvedMuscles) {
                console.warn(`No muscle data for "${exercise.name}". Skipping in volume calculation.`);
                return;
            }

            const totalSets = exercise.sets.length;
            
            exerciseData.involvedMuscles.forEach(muscleInfo => {
                const currentMuscle = muscleInfo.muscle;
                if (!volumeByMuscle[currentMuscle]) {
                    volumeByMuscle[currentMuscle] = { 
                        directSets: 0, 
                        indirectExercisesData: [],
                        directExercises: new Map(), 
                        indirectExercises: new Map(),
                        trainingDays: new Set()
                    };
                }

                if (muscleInfo.role === 'primary') {
                    volumeByMuscle[currentMuscle].directSets += totalSets;
                    volumeByMuscle[currentMuscle].directExercises.set(
                        exercise.name,
                        (volumeByMuscle[currentMuscle].directExercises.get(exercise.name) || 0) + totalSets
                    );
                } else {
                    const activationPercentage = muscleInfo.activation * 100;
                    volumeByMuscle[currentMuscle].indirectExercisesData.push({
                        sets: totalSets,
                        activation: muscleInfo.activation
                    });
                        volumeByMuscle[currentMuscle].indirectExercises.set(
                        exercise.name,
                        { sets: totalSets, activation: activationPercentage }
                    );
                }
                
                if (session.dayOfWeek !== undefined) {
                    volumeByMuscle[currentMuscle].trainingDays.add(session.dayOfWeek);
                }
            });
        });
    });

    const childToParentMap = createChildToParentMap(muscleHierarchy);
    const aggregatedVolume: typeof volumeByMuscle = {};

    Object.entries(volumeByMuscle).forEach(([muscleName, data]) => {
        const parentMuscle = childToParentMap.get(muscleName) || muscleName;
        
        if (!aggregatedVolume[parentMuscle]) {
            aggregatedVolume[parentMuscle] = {
                directSets: 0,
                indirectExercisesData: [],
                directExercises: new Map(),
                indirectExercises: new Map(),
                trainingDays: new Set()
            };
        }
        
        const target = aggregatedVolume[parentMuscle];
        
        target.directSets += data.directSets;
        target.indirectExercisesData.push(...data.indirectExercisesData);
        
        data.directExercises.forEach((sets, name) => {
            target.directExercises.set(name, (target.directExercises.get(name) || 0) + sets);
        });
        
        data.indirectExercises.forEach((info, name) => {
            if (!target.directExercises.has(name)) {
                const existing = target.indirectExercises.get(name);
                if (!existing || info.activation > existing.activation) {
                    target.indirectExercises.set(name, info);
                }
            }
        });
        
        data.trainingDays.forEach(day => target.trainingDays.add(day));
    });


    return Object.entries(aggregatedVolume).map(([muscleGroup, data]) => {
        const frequency = data.trainingDays.size;
        let avgRestDays: number | null = null;
        if (frequency > 1) {
            const sortedDays = Array.from(data.trainingDays).sort((a, b) => a - b);
            let totalGaps = 0;
            for (let i = 0; i < sortedDays.length - 1; i++) {
                totalGaps += sortedDays[i + 1] - sortedDays[i];
            }
            totalGaps += (7 - sortedDays[sortedDays.length - 1]) + sortedDays[0];
            avgRestDays = Math.round(((totalGaps / frequency) - 1) * 10) / 10;
        }
        
        let recoveryStatus: 'Óptimo' | 'En Riesgo de Sobrecarga' | 'Sub-entrenado' | 'N/A' = 'N/A';
        if (avgRestDays !== null) {
            if (avgRestDays < 1) recoveryStatus = 'En Riesgo de Sobrecarga';
            else if (avgRestDays > 3) recoveryStatus = 'Sub-entrenado';
            else recoveryStatus = 'Óptimo';
        }
        
        const weightedIndirectVolume = data.indirectExercisesData.reduce((total, ex) => total + (ex.sets * ex.activation), 0);
        const totalIndirectSets = Array.from(data.indirectExercises.values()).reduce((sum, item) => sum + item.sets, 0);

        return {
            muscleGroup,
            displayVolume: Math.round(data.directSets + weightedIndirectVolume),
            totalSets: Math.round(data.directSets + totalIndirectSets),
            frequency,
            avgRestDays,
            directExercises: Array.from(data.directExercises.entries()).map(([name, sets]) => ({ name, sets })),
            indirectExercises: Array.from(data.indirectExercises.entries()).map(([name, { sets, activation }]) => ({ name, sets, activationPercentage: activation })),
            avgIFI: null,
            recoveryStatus: recoveryStatus,
        };
    }).filter(item => item.displayVolume > 0); // Only return muscles with some volume
};

export const calculateIFI = (exercise: Exercise, history: WorkoutLog[], programs: Program[]): number | null => {
    const exerciseLogs = history.filter(log => log.completedExercises.some(ce => ce.exerciseDbId === exercise.exerciseDbId || ce.exerciseName === exercise.name));
    
    if (exerciseLogs.length < 3) return null; // Need at least 3 data points

    // 1. Base Fatigue (from user feedback)
    const fatigueRatings = exerciseLogs.map(log => log.completedExercises.find(ce => ce.exerciseDbId === exercise.exerciseDbId || ce.exerciseName === exercise.name)?.perceivedFatigue).filter(Boolean) as number[];
    if (fatigueRatings.length < 2) return null;
    const baseFatigue = fatigueRatings.reduce((a, b) => a + b, 0) / fatigueRatings.length;

    // 2. Progression Factor (rate of 1RM improvement)
    const e1rms = exerciseLogs.map(log => Math.max(...(log.completedExercises.find(ce => ce.exerciseDbId === exercise.exerciseDbId || ce.exerciseName === exercise.name)?.sets.map(s => calculateBrzycki1RM(s.weight || 0, s.completedReps || 0)) || [0])));
    const firstHalfAvg = e1rms.slice(0, Math.floor(e1rms.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(e1rms.length / 2);
    const secondHalfAvg = e1rms.slice(Math.floor(e1rms.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(e1rms.length / 2);
    
    let progressionFactor = 1.0;
    if (firstHalfAvg > 0) {
        const change = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
        // If improving (change > 0), fatigue is perceived as less taxing (factor < 1).
        // If stagnating or regressing (change <= 0), fatigue is more taxing (factor > 1).
        progressionFactor = 1 - (change * 0.5); // Max 50% adjustment
    }

    // 3. Intensity Factor (deviation from RPE/RIR targets)
    // This is complex, let's simplify for now: assume it's neutral.
    const intensityFactor = 1.0;

    // 4. Volume Factor (how much volume is being done for this muscle)
    // This requires a full volume analysis. Simplified approach:
    const volumeFactor = 1.0; 

    // Calculate Final IFI
    let ifi = baseFatigue * progressionFactor * intensityFactor * volumeFactor;

    // Normalize to 1-10 scale
    ifi = Math.max(1, Math.min(10, ifi));

    return parseFloat(ifi.toFixed(1));
};