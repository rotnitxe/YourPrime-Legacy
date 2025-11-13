// services/aiService.ts
import { 
    Settings, Program, WorkoutLog, SkippedWorkoutLog, BodyProgressLog, NutritionLog, 
    Session, ProgramWeek, Exercise, ChatMessage, GenerateContentResponse, MuscleVolumeAnalysis,
    SfrData, ProgramProgressInsight, ExerciseMuscleInfo, FoodItem, WarmupStep, CoachInsight, PerformanceAnalysis, ImprovementSuggestion,
    BodyLabAnalysis, MuscleGroupAnalysis, BiomechanicalData, BiomechanicalAnalysis, MobilityExercise, PantryItem
} from '../types';
import * as gemini from './geminiService';
import * as deepseek from './deepseekService';
import * as gpt from './gptService';
import { MUSCLE_GROUPS } from '../data/exerciseList';
import { cacheService } from './cacheService';

// --- Type Definitions ---
type AiProviderModule = typeof gemini | typeof deepseek | typeof gpt;
type AiFunction = keyof (typeof gemini & typeof deepseek & typeof gpt);
type ProviderInfo = { name: string; module: AiProviderModule };


// --- Helper Functions ---
const getProviders = (settings: Settings, functionName: AiFunction): ProviderInfo[] => {
    const providerMap: { [key: string]: AiProviderModule } = { gemini, deepseek, gpt };

    // Functions that REQUIRE Gemini's specific capabilities (vision, search)
    const geminiOnlyFunctions: AiFunction[] = [
        'generateImages', 
        'getCommunityHighlights', 
        'searchWebForExerciseImages', 
        'searchWebForExerciseVideos', 
        'analyzeExerciseVideo',
        'analyzeMealPhoto',
        'searchGoogleImages'
    ];

    if (geminiOnlyFunctions.includes(functionName)) {
        return [{ name: 'gemini', module: gemini }];
    }
    
    const primaryProviderName = settings.apiProvider || 'gemini';
    const providers: ProviderInfo[] = [];
    
    let primaryName = primaryProviderName;
    let fallback1Name: string = 'gemini';
    let fallback2Name: string = 'deepseek';

    if (primaryProviderName === 'gemini') { fallback1Name = 'gpt'; fallback2Name = 'deepseek'; }
    else if (primaryProviderName === 'gpt') { fallback1Name = 'deepseek'; fallback2Name = 'gemini'; }
    else if (primaryProviderName === 'deepseek') { fallback1Name = 'gpt'; fallback2Name = 'gemini'; }

    providers.push({ name: primaryName, module: providerMap[primaryName] });
    
    if (settings.fallbackEnabled) {
        if (fallback1Name !== primaryName) providers.push({ name: fallback1Name, module: providerMap[fallback1Name] });
        if (fallback2Name !== primaryName && fallback2Name !== fallback1Name) providers.push({ name: fallback2Name, module: providerMap[fallback2Name] });
    }
    
    // Return unique providers
    const uniqueProviderNames = new Set<string>();
    return providers.filter(p => {
        if (uniqueProviderNames.has(p.name)) {
            return false;
        }
        uniqueProviderNames.add(p.name);
        return true;
    });
};


const safeJsonParse = <T,>(data: string | object, fallback: T): T => {
    if (typeof data === 'object' && data !== null) {
        return data as T;
    }
    if (typeof data !== 'string') {
        console.error("AI Service: safeJsonParse received non-string, non-object data:", data);
        return fallback;
    }
    try {
        const cleanedJsonString = data.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanedJsonString) as T;
    } catch (error) {
        console.error("AI Service: Failed to parse JSON:", error, "Raw string:", data);
        return fallback;
    }
};

// --- Execution Wrappers ---
const performAICall = async (
    functionName: AiFunction,
    args: any[],
    settings: Settings
): Promise<any> => {
    const providers = getProviders(settings, functionName);
    let lastError: any = null;

    for (const { name, module: providerModule } of providers) {
        if (typeof (providerModule as any)[functionName] === 'function') {
            try {
                // Correctly pass arguments and settings to the provider function
                const response = await ((providerModule as any)[functionName] as Function)(...args, settings);
                return response;
            } catch (error) {
                console.warn(`Provider '${name}' failed for ${String(functionName)}. Trying next. Error:`, error);
                lastError = error;
            }
        }
    }
    throw lastError || new Error(`No provider could execute ${String(functionName)}`);
};


const performAIStreamCall = async function*(
    functionName: AiFunction,
    args: any[],
    settings: Settings
): AsyncGenerator<GenerateContentResponse> {
    const providers = getProviders(settings, functionName);
    let lastError: any = null;
    
    for (const { name, module: providerModule } of providers) {
         if (typeof (providerModule as any)[functionName] === 'function') {
            try {
                // Correctly pass arguments and settings
                const stream = ((providerModule as any)[functionName] as Function)(...args, settings);
                for await (const chunk of stream) {
                    yield chunk;
                }
                return; // End the generator successfully
            } catch (error) {
                console.warn(`Provider '${name}' failed for streaming ${String(functionName)}. Trying next. Error:`, error);
                lastError = error;
            }
        }
    }
    throw lastError || new Error(`No provider could execute streaming ${String(functionName)}`);
}


// --- Exported AI Functions ---
export const generateExerciseProgressReport = (exerciseName: string, exerciseLogs: WorkoutLog[], settings: Settings): Promise<{ summary: string; positives: string[]; areasForImprovement: string[] }> => {
    return performAICall('generateExerciseProgressReport', [exerciseName, exerciseLogs], settings);
};

export const getNutritionalInfoForPantryItem = (itemName: string, settings: Settings): Promise<{ name: string; calories: number; protein: number; carbs: number; fats: number; }> => {
    return performAICall('getNutritionalInfoForPantryItem', [itemName], settings);
};

export const generateMealSuggestion = (pantryItems: PantryItem[], remainingMacros: { calories: number; protein: number; carbs: number; fats: number; }, settings: Settings): Promise<{ suggestions: any[] }> => {
    return performAICall('generateMealSuggestion', [pantryItems, remainingMacros], settings);
};

export const generateWeightProjection = (
    avgIntake: number,
    tdee: number,
    weightHistory: { date: string, weight?: number }[],
    targetWeight: number,
    settings: Settings
): Promise<{ projection: string; summary: string }> => {
    return performAICall('generateWeightProjection', [avgIntake, tdee, weightHistory, targetWeight], settings);
};

export const generateExerciseCollection = async (purpose: string, settings: Settings): Promise<{ collectionName: string; exercises: { name: string; justification: string; }[] }> => {
    const result = await performAICall('generateExercisesForPurpose', [purpose], settings);
    return {
        collectionName: purpose,
        exercises: result.exercises.map((ex: any) => ({ name: ex.name, justification: ex.justification }))
    };
};

export const generateExercisesForPurpose = (purpose: string, settings: Settings): Promise<{ exercises: { name: string; justification: string; primaryMuscles: string[] }[] }> => {
    return performAICall('generateExercisesForPurpose', [purpose], settings);
};

export const generateBodyLabAnalysis = (programs: Program[], history: WorkoutLog[], settings: Settings): Promise<BodyLabAnalysis> => {
    return performAICall('generateBodyLabAnalysis', [programs, history, settings], settings);
};

export const generateBiomechanicalAnalysis = (data: BiomechanicalData, exercises: string[], settings: Settings): Promise<BiomechanicalAnalysis> => {
    return performAICall('generateBiomechanicalAnalysis', [data, exercises], settings);
};

export const generateMobilityRoutine = (target: string, settings: Settings): Promise<MobilityExercise[]> => {
    return performAICall('generateMobilityRoutine', [target], settings);
};

export const generateMuscleGroupAnalysis = (muscleName: string, trainingData: any, settings: Settings): Promise<MuscleGroupAnalysis> => {
    return performAICall('generateMuscleGroupAnalysis', [muscleName, trainingData, settings], settings);
};

export const generateWorkoutPostSummary = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ title: string; summary: string }> => {
    return performAICall('generateWorkoutPostSummary', [log, previousLogs], settings);
};

export const generateOnThisDayMessage = (exerciseName: string, oldSet: { weight: number; reps: number }, newSet: { weight: number; reps: number }, settings: Settings): Promise<{ message: string }> => {
    return performAICall('generateOnThisDayMessage', [exerciseName, oldSet, newSet], settings);
};

export const suggestExerciseAlternatives = (exercise: Exercise, reason: string, primaryMuscle: string, settings: Settings): Promise<{ alternatives: { name: string; justification: string }[] }> => {
    return performAICall('suggestExerciseAlternatives', [exercise, reason, primaryMuscle], settings);
};

export const generateExerciseAlias = async (exerciseName: string, settings: Settings): Promise<{ alias: string }> => {
    const cacheKey = `alias_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<{ alias: string }>(cacheKey);
    if (cached) return cached;

    const prompt = `Sugiere un alias o sobrenombre común (como siglas o un nombre corto en inglés/español) para el ejercicio: "${exerciseName}". Responde ÚNICAMENTE con un objeto JSON: { "alias": "string" }.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    const result = safeJsonParse(response.text, { alias: '' });
    await cacheService.set(cacheKey, result);
    return result;
};

export const generateImage = (prompt: string, settings: Settings): Promise<string> => {
    return performAICall('generateImages', [prompt], settings).then(res => (res as any).base64Image);
};

export const generateSession = async (prompt: string, settings: Settings): Promise<Omit<Session, 'id'>> => {
    const systemInstruction = `Eres un experto entrenador de fitness. Genera una sesión de entrenamiento basada en la petición del usuario. Responde ÚNICAMENTE con un objeto JSON en español que siga esta estructura: { "name": "Nombre de la Sesión", "description": "Breve descripción", "exercises": [{ "name": "Nombre del Ejercicio", "restTime": 90, "sets": [{ "targetReps": 10, "targetRPE": 8 }] }] }. Asegúrate de que las repeticiones estén entre 1-30 y el RPE entre 5-10. El tiempo de descanso es en segundos. Todos los valores de texto en el JSON deben estar en español.`;
    const response = await performAICall('generateContent', [prompt, systemInstruction, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { name: 'Error', description: 'Failed to parse', exercises: [] });
};

export const generateWarmupForSession = async (session: Session, settings: Settings): Promise<Omit<WarmupStep, 'id'>[]> => {
    const prompt = `Crea una rutina de calentamiento dinámico para esta sesión de entrenamiento: ${JSON.stringify(session.exercises.map(e => e.name))}. Enfócate en la movilidad y activación de los músculos involucrados. Proporciona 3-5 pasos. Responde ÚNICAMENTE con un array JSON de objetos con las claves "name", "sets", y "reps" (ej., "10" o "30s"), todo en español.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, []);
};

export const analyzeWorkoutVolume = async (volumeData: Omit<MuscleVolumeAnalysis, 'assessment'>[], settings: Settings): Promise<MuscleVolumeAnalysis[]> => {
    const prompt = `Analiza estos datos de volumen de entrenamiento semanal. Para cada grupo muscular, proporciona una 'assessment' (evaluación) basada en principios establecidos (ej., MEV, MAV, MRV). Responde ÚNICAMENTE con un array JSON de objetos, añadiendo la clave 'assessment' a cada objeto. Los valores deben estar en español. Datos: ${JSON.stringify(volumeData)}`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, volumeData.map(v => ({...v, assessment: 'N/A'})));
};

export const estimateSFR = async (exerciseName: string, settings: Settings): Promise<{ score: number, justification: string }> => {
    const cacheKey = `sfr_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<{ score: number, justification: string }>(cacheKey);
    if (cached) return cached;
    
    const prompt = `Estima el Ratio Estímulo-Fatiga (SFR) para el ejercicio "${exerciseName}" en una escala de 1-10. Un 10 significa altísimo estímulo con muy poca fatiga sistémica (ej. curl de bíceps en polea). Un 1 significa altísima fatiga para un estímulo localizado bajo (ej. burpees hasta el fallo). Un movimiento como el Peso Muerto Convencional tendría un SFR de 3-4. Considera la carga neural, el daño muscular y el estrés articular. Responde ÚNICAMENTE con un objeto JSON en español: { "score": number, "justification": "string" }.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    const result = safeJsonParse(response.text, { score: 5, justification: 'Could not analyze.' });
    await cacheService.set(cacheKey, result);
    return result;
};

export const generateProgramProgressInsights = async (program: Program, history: WorkoutLog[], volumeDataWithAssessment: MuscleVolumeAnalysis[], sfrData: SfrData[], settings: Settings): Promise<ProgramProgressInsight> => {
    const prompt = `Analiza el progreso de mi programa de entrenamiento. Te proporcionaré la estructura del programa, historial, análisis de volumen y datos de SFR. Dame un resumen, correlaciones positivas y áreas de mejora. Responde ÚNICAMENTE con JSON en español. Datos: ${JSON.stringify({ program, history: history.slice(-10), volume: volumeDataWithAssessment, sfr: sfrData })}`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { summary: 'Error', positiveCorrelations: [], improvementAreas: [] });
};

export const getAICoachInsights = async (history: WorkoutLog[], programs: Program[], settings: Settings, bodyProgress: BodyProgressLog[], nutritionLogs: NutritionLog[]): Promise<CoachInsight> => {
    const prompt = `Analiza las últimas 4 semanas de datos de entrenamiento. Identifica tendencias, posibles estancamientos o riesgos. Proporciona un hallazgo principal, 2-3 sugerencias accionables y un alertLevel ('info', 'warning', 'danger'). Responde ÚNICAMENTE con JSON en español. Datos: ${JSON.stringify({ history: history.slice(-20) })}`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { title: 'Error', findings: 'Could not analyze.', suggestions: [], alertLevel: 'danger' });
};

export const getCoachChatResponseStream = (prompt: string, messages: ChatMessage[], programs: Program[], history: WorkoutLog[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    const context = `Contexto: El usuario tiene ${programs.length} programas. Últimos 5 entrenamientos: ${JSON.stringify(history.slice(-5))}.`;
    const systemInstruction = `Eres un entrenador de fitness servicial y alentador. Responde en español. ${context}`;
    const allMessages = [...messages.slice(-10), { role: 'user', parts: [{ text: prompt }] }] as any;
    return performAIStreamCall('generateContentStream', [allMessages, systemInstruction], settings);
};

export const getPhysicalProgressChatResponseStream = (prompt: string, messages: ChatMessage[], bodyProgress: BodyProgressLog[], nutritionLogs: NutritionLog[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    const context = `Contexto: Datos de peso/nutrición del usuario disponibles.`;
    const systemInstruction = `Eres un entrenador de nutrición y progreso servicial. Responde en español. ${context}`;
    const allMessages = [...messages.slice(-10), { role: 'user', parts: [{ text: prompt }] }] as any;
    return performAIStreamCall('generateContentStream', [allMessages, systemInstruction], settings);
};

export const getPeriodizationCoachStream = (prompt: string, messages: ChatMessage[], settings: Settings): AsyncGenerator<GenerateContentResponse> => {
    const systemInstruction = `Eres un entrenador experto especializado en periodización del entrenamiento de fuerza. Responde en español.`;
    const allMessages = [...messages.slice(-10), { role: 'user', parts: [{ text: prompt }] }] as any;
    return performAIStreamCall('generateContentStream', [allMessages, systemInstruction], settings);
};

export const analyzeWeeklyProgress = async (thisWeek: WorkoutLog[], lastWeek: WorkoutLog[], skipped: SkippedWorkoutLog[], settings: Settings): Promise<{ percentageChange: number; summary: string }> => {
    const prompt = `Compara el volumen de entrenamiento de esta semana con la anterior. Calcula el cambio porcentual en el volumen total (peso * reps * series). Proporciona un resumen corto y motivacional del rendimiento de la semana. Responde ÚNICAMENTE con JSON en español: { "percentageChange": number, "summary": "string" }. Datos: ${JSON.stringify({ thisWeek, lastWeek, skipped })}`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { percentageChange: 0, summary: 'Análisis fallido.' });
};

export const generatePerformanceAnalysis = async (history: WorkoutLog[], skippedLogs: SkippedWorkoutLog[], settings: Settings): Promise<PerformanceAnalysis> => {
    const prompt = `Analiza los últimos 7 días de datos de entrenamiento. Proporciona una puntuación de rendimiento (1-7), un resumen breve, 2 puntos positivos y 2 puntos negativos/de mejora. Responde ÚNICAMENTE con JSON en español: { "score": number, "summary": "string", "positivePoints": ["string"], "negativePoints": ["string"] }. Datos: ${JSON.stringify({ workouts: history.slice(-10), skipped: skippedLogs })}`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { score: 0, summary: 'Error', positivePoints: [], negativePoints: [] });
};

export const generateWeekFromPrompt = async (program: Program, prompt: string, settings: Settings): Promise<Omit<ProgramWeek, 'id'>> => {
    const context = `Contexto del programa actual: ${program.name}. Sesiones de la última semana: ${JSON.stringify(program.macrocycles.slice(-1)[0].mesocycles.slice(-1)[0].weeks.slice(-1)[0]?.sessions.map(s => s.name) || 'N/A')}`;
    const systemInstruction = `Eres un experto entrenador de fitness. Crea una nueva semana de entrenamientos basada en el objetivo del usuario, usando el contexto proporcionado para aplicar sobrecarga progresiva. Responde ÚNICAMENTE con un objeto JSON en español: { "name": "Nombre de la Semana", "sessions": [{ "name": "Nombre de la Sesión", "description": "...", "exercises": [...] }] }. La estructura de los ejercicios debe ser la misma que en generateSession.`;
    const fullPrompt = `${context}\n\nObjetivo del Usuario: ${prompt}`;
    const response = await performAICall('generateContent', [fullPrompt, systemInstruction, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { name: 'Error', sessions: [] });
};

export const getNutritionalInfo = async (description: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    const cacheKey = `nutrition_${description.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<Omit<FoodItem, 'id'>>(cacheKey);
    if (cached) return cached;

    const prompt = `Estima la información nutricional para: "${description}". Responde ÚNICAMENTE con un objeto JSON: { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number }, todo en español.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    
    const parsed = safeJsonParse<Partial<Omit<FoodItem, 'id'>>>(response.text, {});
    const result: Omit<FoodItem, 'id'> = {
        name: parsed.name || 'Análisis fallido',
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fats: parsed.fats || 0,
        servingSize: 1,
        servingUnit: 'unidad'
    };
    await cacheService.set(cacheKey, result);
    return result;
};

export const analyzeMealPhoto = async (base64Image: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    const response = await performAICall('analyzeMealPhoto', [base64Image], settings);
    const parsed = safeJsonParse<Partial<Omit<FoodItem, 'id'>>>(response, {});
    return {
        name: parsed.name || 'Análisis de foto fallido',
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fats: parsed.fats || 0,
        servingSize: 1,
        servingUnit: 'unidad'
    };
};

export const analyzeExerciseVideo = async (base64Video: string, exerciseName: string, settings: Settings): Promise<{ positives: string[], improvements: string[] }> => {
    const response = await performAICall('analyzeExerciseVideo', [base64Video, exerciseName], settings);
    return safeJsonParse(response, { positives: [], improvements: ['Could not analyze video.'] });
};

export const analyzeExerciseMuscles = async (exerciseName: string, settings: Settings): Promise<{ involvedMuscles: ExerciseMuscleInfo['involvedMuscles'] }> => {
    const cacheKey = `muscles_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<{ involvedMuscles: ExerciseMuscleInfo['involvedMuscles'] }>(cacheKey);
    if (cached) return cached;
    
    const validMuscles = MUSCLE_GROUPS.filter(g => g !== 'Todos').join(', ');
    const prompt = `Analiza los músculos involucrados en el ejercicio "${exerciseName}". Responde ÚNICAMENTE con un objeto JSON en español: { "involvedMuscles": [{ "muscle": "string", "activation": number (0.0-1.0), "role": "primary" | "secondary" | "stabilizer" }] }. El campo "muscle" DEBE ser uno de los siguientes valores exactos: [${validMuscles}].`;
    const schema = {
        type: 'OBJECT',
        properties: {
            involvedMuscles: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        muscle: { type: 'STRING' },
                        activation: { type: 'NUMBER' },
                        role: { type: 'STRING' }
                    },
                    required: ['muscle', 'activation', 'role']
                }
            }
        },
        required: ['involvedMuscles']
    };
    const response = await performAICall('generateContent', [prompt, undefined, schema], settings);
    const parsed = safeJsonParse<any>(response.text, null);
    
    let result = { involvedMuscles: [] };
    if (!parsed) {
       result = { involvedMuscles: [] };
    } else if (Array.isArray(parsed.involvedMuscles)) {
       result = { involvedMuscles: parsed.involvedMuscles };
    } else {
        const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (key) result = { involvedMuscles: parsed[key] };
    }
    
    await cacheService.set(cacheKey, result);
    return result;
};

export const generateTimeSaverSuggestions = async (remainingExercises: Exercise[], timeAvailable: number, settings: Settings): Promise<{ suggestions: any[] }> => {
    const prompt = `Me quedan ${timeAvailable} minutos y estos ejercicios restantes: ${JSON.stringify(remainingExercises.map(e => e.name))}. Proporciona 2-3 sugerencias creativas para terminar más rápido (ej., superseries, dropsets, combinar ejercicios). Responde ÚNICAMENTE con un objeto JSON en español: { "suggestions": [{ "title": "string", "description": "string", "changes": [...] }] }`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    return safeJsonParse(response.text, { suggestions: [] });
};

export const generateExerciseDescription = async (exerciseName: string, settings: Settings): Promise<string> => {
    const cacheKey = `desc_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<string>(cacheKey);
    if (cached) return cached;

    const prompt = `Proporciona una descripción concisa de 1-2 frases en español para el ejercicio: "${exerciseName}".`;
    const response = await performAICall('generateContent', [prompt, undefined, undefined], settings);
    await cacheService.set(cacheKey, response.text);
    return response.text;
};

export const getAICoachAnalysis = async (exerciseName: string, settings: Settings): Promise<{ summary: string; pros: string[]; cons: string[] }> => {
    const cacheKey = `coach_analysis_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<{ summary: string; pros: string[]; cons: string[] }>(cacheKey);
    if (cached) return cached;

    const prompt = `Proporciona un análisis de entrenador para "${exerciseName}". Incluye un resumen, 2-3 pros y 2-3 contras. Responde ÚNICAMENTE con JSON en español: { "summary": "string", "pros": ["string"], "cons": ["string"] }.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    const result = safeJsonParse(response.text, { summary: 'Análisis fallido.', pros: [], cons: [] });
    await cacheService.set(cacheKey, result);
    return result;
};

export const getPrimeStarsRating = async (exerciseName: string, settings: Settings): Promise<{ score: number; justification: string; }> => {
    const cacheKey = `primestars_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<{ score: number; justification: string; }>(cacheKey);
    if (cached) return cached;

    const prompt = `Actúa como un kinesiólogo experto. Califica el ejercicio '${exerciseName}' en una escala de 1 a 5 "PrimeStars". Tu calificación debe ser una puntuación holística que considere: 1. Ratio Estímulo-Fatiga (SFR), 2. Transferencia funcional a deportes/vida diaria, 3. Seguridad biomecánica y riesgo lesivo con buena técnica, 4. Potencial de sobrecarga progresiva, 5. Accesibilidad técnica para un levantador promedio. Responde ÚNICAMENTE con un objeto JSON: { "score": number (1-5), "justification": "string (una breve explicación experta de tu puntuación en español)" }.`;
    const response = await performAICall('generateContent', [prompt, undefined, { type: "json_object" }], settings);
    const result = safeJsonParse(response.text, { score: 3, justification: 'No se pudo analizar.' });
    await cacheService.set(cacheKey, result);
    return result;
};

export const getCommunityOpinionForExercise = async (exerciseName: string, settings: Settings): Promise<string[]> => {
    const cacheKey = `community_${exerciseName.toLowerCase().replace(/\s/g, '_')}`;
    const cached = await cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const result = await performAICall('getCommunityOpinionForExercise', [exerciseName], settings);
    await cacheService.set(cacheKey, result);
    return result;
};

export const searchGoogleImages = (query: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
    return performAICall('searchGoogleImages', [query], settings);
};

export const searchWebForExerciseImages = (exerciseName: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
     return performAICall('searchWebForExerciseImages', [exerciseName], settings);
};

export const searchWebForExerciseVideos = (exerciseName: string, settings: Settings): Promise<{ videoUrls: string[] }> => {
     return performAICall('searchWebForExerciseVideos', [exerciseName], settings);
};

export const getCommunityHighlights = (settings: Settings): Promise<{ highlights: { title: string, url: string }[] }> => {
     return performAICall('getCommunityHighlights', [], settings);
};

export const generateSessionScore = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ score: number }> => {
    return performAICall('generateSessionScore', [log, previousLogs], settings);
};

export const generateImprovementSuggestions = (history: WorkoutLog[], programs: Program[], settings: Settings): Promise<ImprovementSuggestion[]> => {
    return performAICall('generateImprovementSuggestions', [history, programs], settings);
};
