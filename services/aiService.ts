import { 
    Settings, Program, WorkoutLog, Session, WarmupStep, MuscleVolumeAnalysis, SfrData, 
    ProgramProgressInsight, CoachInsight, PerformanceAnalysis, ProgramWeek, NutritionLog, 
    BodyProgressLog, FoodItem, ExerciseMuscleInfo, Exercise, SkippedWorkoutLog, 
    ImprovementSuggestion, BodyLabAnalysis, MuscleGroupAnalysis, BiomechanicalData, 
    BiomechanicalAnalysis, MobilityExercise, PantryItem, ChatMessage, GenerateContentResponse 
} from '../types';
import * as geminiService from './geminiService';
import * as deepseekService from './deepseekService';
import * as gptService from './gptService';

const getProvider = (settings: Settings) => {
    switch (settings.apiProvider) {
        case 'deepseek': return deepseekService;
        case 'gpt': return gptService;
        case 'gemini': default: return geminiService;
    }
};

// Wrapper for streaming functions
async function* streamWrapper(generator: AsyncGenerator<GenerateContentResponse>): AsyncGenerator<GenerateContentResponse> {
    for await (const chunk of generator) {
        yield chunk;
    }
}

export const generateSession = async (prompt: string, settings: Settings): Promise<Omit<Session, 'id'>> => {
    return getProvider(settings).generateSession(prompt, settings);
};

export const generateWarmupForSession = async (session: Session, settings: Settings): Promise<Omit<WarmupStep, 'id'>[]> => {
    return getProvider(settings).generateWarmupForSession(session, settings);
};

export const analyzeWorkoutVolume = async (volumeData: Omit<MuscleVolumeAnalysis, 'assessment'>[], settings: Settings): Promise<MuscleVolumeAnalysis[]> => {
    return getProvider(settings).analyzeWorkoutVolume(volumeData, settings);
};

export const estimateSFR = async (exerciseName: string, settings: Settings): Promise<{ score: number, justification: string }> => {
    return getProvider(settings).estimateSFR(exerciseName, settings);
};

export const generateProgramProgressInsights = async (program: Program, history: WorkoutLog[], volumeDataWithAssessment: MuscleVolumeAnalysis[], sfrData: SfrData[], settings: Settings): Promise<ProgramProgressInsight> => {
    return getProvider(settings).generateProgramProgressInsights(program, history, volumeDataWithAssessment, sfrData, settings);
};

export const getAICoachInsights = async (history: WorkoutLog[], programs: Program[], settings: Settings, bodyProgress: BodyProgressLog[], nutritionLogs: NutritionLog[]): Promise<CoachInsight> => {
    return getProvider(settings).getAICoachInsights(history, programs, settings, bodyProgress, nutritionLogs);
};

export const getNutritionalInfo = async (description: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    return getProvider(settings).getNutritionalInfo(description, settings);
};

export const analyzeWeeklyProgress = async (thisWeek: WorkoutLog[], lastWeek: WorkoutLog[], skipped: SkippedWorkoutLog[], settings: Settings): Promise<{ percentageChange: number; summary: string }> => {
    return getProvider(settings).analyzeWeeklyProgress(thisWeek, lastWeek, skipped, settings);
};

export const generatePerformanceAnalysis = async (history: WorkoutLog[], skippedLogs: SkippedWorkoutLog[], settings: Settings): Promise<PerformanceAnalysis> => {
    return getProvider(settings).generatePerformanceAnalysis(history, skippedLogs, settings);
};

export const generateWeekFromPrompt = async (program: Program, prompt: string, settings: Settings): Promise<Omit<ProgramWeek, 'id'>> => {
    return getProvider(settings).generateWeekFromPrompt(program, prompt, settings);
};

export const getCoachChatResponseStream = (prompt: string, messages: ChatMessage[], programs: Program[], history: WorkoutLog[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    return streamWrapper(getProvider(settings).getCoachChatResponseStream(prompt, messages, programs, history, settings));
};

export const getPhysicalProgressChatResponseStream = (prompt: string, messages: ChatMessage[], bodyProgress: BodyProgressLog[], nutritionLogs: NutritionLog[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    return streamWrapper(getProvider(settings).getPhysicalProgressChatResponseStream(prompt, messages, bodyProgress, nutritionLogs, settings));
};

export const getPeriodizationCoachStream = (prompt: string, messages: ChatMessage[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    return streamWrapper(getProvider(settings).getPeriodizationCoachStream(prompt, messages, settings));
};

export const generateImage = async (prompt: string, settings: Settings): Promise<string> => {
    const result = await getProvider(settings).generateImages(prompt, settings);
    return result.base64Image || ''; // Adapting return type
};

export const analyzeMealPhoto = async (base64Image: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    return getProvider(settings).analyzeMealPhoto(base64Image, settings);
};

export const analyzeExerciseVideo = async (base64Video: string, exerciseName: string, settings: Settings): Promise<{ positives: string[], improvements: string[] }> => {
    return getProvider(settings).analyzeExerciseVideo(base64Video, exerciseName, settings);
};

export const analyzeExerciseMuscles = async (exerciseName: string, settings: Settings): Promise<{ involvedMuscles: any[] }> => {
    return getProvider(settings).analyzeExerciseMuscles(exerciseName, settings);
};

export const searchGoogleImages = async (query: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
    return getProvider(settings).searchGoogleImages(query, settings);
};

export const searchWebForExerciseImages = async (exerciseName: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
    return getProvider(settings).searchWebForExerciseImages(exerciseName, settings);
};

export const searchWebForExerciseVideos = async (exerciseName: string, settings: Settings): Promise<{ videoUrls: string[] }> => {
    return getProvider(settings).searchWebForExerciseVideos(exerciseName, settings);
};

export const getCommunityHighlights = async (settings: Settings): Promise<{ highlights: { title: string, url: string }[] }> => {
    return getProvider(settings).getCommunityHighlights(settings);
};

export const getCommunityOpinionForExercise = async (exerciseName: string, settings: Settings): Promise<string[]> => {
    return getProvider(settings).getCommunityOpinionForExercise(exerciseName, settings);
};

export const getAICoachAnalysis = async (exerciseName: string, settings: Settings): Promise<any> => {
    return getProvider(settings).getAICoachAnalysis(exerciseName, settings);
};

export const getAIGlobalRating = async (exerciseName: string, settings: Settings): Promise<{ score: number }> => {
    return getProvider(settings).getAIGlobalRating(exerciseName, settings);
};

export const generateSessionScore = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ score: number }> => {
    return getProvider(settings).generateSessionScore(log, previousLogs, settings);
};

export const generateOnThisDayMessage = async (exerciseName: string, oldSet: { weight: number; reps: number }, newSet: { weight: number; reps: number }, settings: Settings): Promise<{ message: string }> => {
    return getProvider(settings).generateOnThisDayMessage(exerciseName, oldSet, newSet, settings);
};

export const suggestExerciseAlternatives = async (exercise: Exercise, reason: string, primaryMuscle: string, settings: Settings): Promise<{ alternatives: { name: string; justification: string }[] }> => {
    return getProvider(settings).suggestExerciseAlternatives(exercise, reason, primaryMuscle, settings);
};

export const generateExerciseAlias = async (exerciseName: string, settings: Settings): Promise<{ alias: string }> => {
    return getProvider(settings).generateExerciseAlias(exerciseName, settings);
};

export const getPrimeStarsRating = async (exerciseName: string, settings: Settings): Promise<{ score: number; justification: string; }> => {
    return getProvider(settings).getPrimeStarsRating(exerciseName, settings);
};

export const generateTimeSaverSuggestions = async (remainingExercises: Exercise[], timeAvailable: number, settings: Settings): Promise<{ suggestions: any[] }> => {
    return getProvider(settings).generateTimeSaverSuggestions(remainingExercises, timeAvailable, settings);
};

export const generateExerciseDescription = async (exerciseName: string, settings: Settings): Promise<string> => {
    return getProvider(settings).generateExerciseDescription(exerciseName, settings);
};

export const generateWorkoutPostSummary = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ title: string; summary: string }> => {
    return getProvider(settings).generateWorkoutPostSummary(log, previousLogs, settings);
};

export const generateImprovementSuggestions = async (history: WorkoutLog[], programs: Program[], settings: Settings): Promise<ImprovementSuggestion[]> => {
    return getProvider(settings).generateImprovementSuggestions(history, programs, settings);
};

export const generateBodyLabAnalysis = async (programs: Program[], history: WorkoutLog[], settings: Settings): Promise<BodyLabAnalysis> => {
    return getProvider(settings).generateBodyLabAnalysis(programs, history, settings);
};

export const generateMuscleGroupAnalysis = async (muscleName: string, trainingData: any, settings: Settings): Promise<MuscleGroupAnalysis> => {
    const result = await getProvider(settings).generateMuscleGroupAnalysis(muscleName, trainingData, settings);
    // Ensure assessment is one of the allowed types
    const allowedAssessments = ['Subentrenado', 'Optimo', 'Sobrecargado'];
    if (!allowedAssessments.includes(result.assessment)) {
        result.assessment = 'Optimo'; // Default fallback
    }
    return result as MuscleGroupAnalysis;
};

export const generateBiomechanicalAnalysis = async (data: BiomechanicalData, exercises: string[], settings: Settings): Promise<BiomechanicalAnalysis> => {
    return getProvider(settings).generateBiomechanicalAnalysis(data, exercises, settings);
};

export const generateMobilityRoutine = async (target: string, settings: Settings): Promise<MobilityExercise[]> => {
    return getProvider(settings).generateMobilityRoutine(target, settings);
};

export const generateWeightProjection = async (avgIntake: number, tdee: number, weightHistory: { date: string, weight?: number }[], targetWeight: number, settings: Settings): Promise<{ projection: string; summary: string }> => {
    return getProvider(settings).generateWeightProjection(avgIntake, tdee, weightHistory, targetWeight, settings);
};

export const getNutritionalInfoForPantryItem = async (itemName: string, settings: Settings): Promise<{ name: string; calories: number; protein: number; carbs: number; fats: number; }> => {
    return getProvider(settings).getNutritionalInfoForPantryItem(itemName, settings);
};

export const generateMealSuggestion = async (pantryItems: PantryItem[], remainingMacros: any, settings: Settings): Promise<{ suggestions: any[] }> => {
    return getProvider(settings).generateMealSuggestion(pantryItems, remainingMacros, settings);
};

export const generateExercisesForPurpose = async (purpose: string, settings: Settings): Promise<{ exercises: { name: string; justification: string; primaryMuscles: string[] }[] }> => {
    return getProvider(settings).generateExercisesForPurpose(purpose, settings);
};

export const generateExerciseProgressReport = async (exerciseName: string, exerciseLogs: WorkoutLog[], settings: Settings): Promise<{ summary: string; positives: string[]; areasForImprovement: string[] }> => {
    return getProvider(settings).generateExerciseProgressReport(exerciseName, exerciseLogs, settings);
};

// Alias / Adapter for generateExerciseCollection
export const generateExerciseCollection = async (purpose: string, settings: Settings): Promise<{ collectionName: string; exercises: { name: string; justification: string }[] }> => {
    const result = await generateExercisesForPurpose(purpose, settings);
    return {
        collectionName: purpose,
        exercises: result.exercises.map(ex => ({
            name: ex.name,
            justification: ex.justification
        }))
    };
};
