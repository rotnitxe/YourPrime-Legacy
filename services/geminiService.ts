// services/geminiService.ts
import { GoogleGenAI, Content, GenerateContentResponse as GenAIResponse, Type } from "@google/genai";
import { ChatMessage, Settings, WorkoutLog, Exercise, PlanDeviation, Program, ImprovementSuggestion, BodyLabAnalysis, BiomechanicalAnalysis, BiomechanicalData, MobilityExercise, PantryItem, Session, WarmupStep, MuscleVolumeAnalysis, SfrData, ProgramProgressInsight, CoachInsight, PerformanceAnalysis, ProgramWeek, NutritionLog, BodyProgressLog, FoodItem, ExerciseMuscleInfo, SkippedWorkoutLog, MuscleGroupAnalysis, GenerateContentResponse } from '../types';
import { calculateBrzycki1RM } from "../utils/calculations";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | undefined = undefined;

const getClient = (settings: Settings): GoogleGenAI => {
    const apiKey = settings.apiKeys?.gemini;

    if (!apiKey) {
        throw new Error("La clave API de Gemini no está configurada en los ajustes.");
    }

    if (ai && currentApiKey === apiKey) {
        return ai;
    }

    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
    return ai;
};


const makeGenerateContentRequest = async (
    contents: string | Content,
    config: any,
    settings: Settings
): Promise<GenAIResponse> => {
    const client = getClient(settings);
    if (!navigator.onLine) {
        throw new Error("Estás sin conexión. Esta función requiere acceso a internet.");
    }
    try {
        const result = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config,
        });
        return result;
    } catch (error: any) {
        console.error("Error en la solicitud a Gemini:", error);
        if (error.toString().includes('429') || (error.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
             throw new Error("Límite de solicitudes a Gemini excedido. Por favor, revisa tu plan o inténtalo más tarde.");
        }
        throw error;
    }
};

const makeGenerateContentStreamRequest = async (
    contents: Content[],
    config: any,
    settings: Settings
): Promise<AsyncGenerator<GenAIResponse>> => {
    const client = getClient(settings);
    if (!navigator.onLine) {
        throw new Error("Estás sin conexión. Esta función requiere acceso a internet.");
    }
    try {
        const resultStream = await client.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config,
        });
        return resultStream;
    } catch (error: any) {
        console.error("Error en la solicitud de streaming a Gemini:", error);
         if (error.toString().includes('429') || (error.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
             throw new Error("Límite de solicitudes a Gemini excedido. Por favor, revisa tu plan o inténtalo más tarde.");
        }
        throw error;
    }
};


// --- Exported AI Functions (matching aiService expectations) ---

export const generateSession = async (prompt: string, settings: Settings): Promise<Omit<Session, 'id'>> => {
    const systemInstruction = `Eres un experto entrenador de fitness. Genera una sesión de entrenamiento basada en la petición del usuario. Responde ÚNICAMENTE con un objeto JSON en español que siga esta estructura: { "name": "...", "description": "...", "exercises": [{ "name": "...", "trainingMode": "reps" | "time", "restTime": 90, "sets": [{ "targetReps": 10, "targetDuration": 60, "targetRPE": 8 }] }] }. Para sets de repeticiones, usa 'targetReps'. Para sets de tiempo, usa 'targetDuration' en segundos.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            exercises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        trainingMode: { type: Type.STRING, enum: ["reps", "time"] },
                        restTime: { type: Type.NUMBER },
                        sets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    targetReps: { type: Type.NUMBER },
                                    targetDuration: { type: Type.NUMBER },
                                    targetRPE: { type: Type.NUMBER },
                                    intensityMode: { type: Type.STRING, enum: ["rpe", "rir", "failure", "approx"] }
                                }
                            }
                        }
                    },
                    required: ["name", "sets"]
                }
            }
        },
        required: ["name", "exercises"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const generateWarmupForSession = async (session: Session, settings: Settings): Promise<Omit<WarmupStep, 'id'>[]> => {
    const prompt = `Crea una rutina de calentamiento dinámico para esta sesión de entrenamiento: ${JSON.stringify(session.exercises.map(e => e.name))}. Enfócate en la movilidad y activación de los músculos involucrados. Proporciona 3-5 pasos. Responde ÚNICAMENTE con un array JSON de objetos con las claves "name", "sets", y "reps" (ej., "10" o "30s"), todo en español.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING }
            },
            required: ["name", "sets", "reps"]
        }
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    return JSON.parse(response.text);
};

export const analyzeWorkoutVolume = async (volumeData: Omit<MuscleVolumeAnalysis, 'assessment'>[], settings: Settings): Promise<MuscleVolumeAnalysis[]> => {
    const prompt = `Analiza estos datos de volumen de entrenamiento semanal. Para cada grupo muscular, proporciona una 'assessment' (evaluación) basada en principios establecidos (ej., MEV, MAV, MRV). Responde ÚNICAMENTE con un array JSON de objetos, añadiendo la clave 'assessment' a cada objeto. Los valores deben estar en español. Datos: ${JSON.stringify(volumeData)}`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const generateProgramProgressInsights = async (program: Program, history: WorkoutLog[], volumeDataWithAssessment: MuscleVolumeAnalysis[], sfrData: SfrData[], settings: Settings): Promise<ProgramProgressInsight> => {
    const prompt = `Analiza el progreso de mi programa de entrenamiento. Te proporcionaré la estructura del programa, historial, análisis de volumen y datos de SFR. Dame un resumen, correlaciones positivas y áreas de mejora. Responde ÚNICAMENTE con JSON en español. Datos: ${JSON.stringify({ program, history: history.slice(-10), volume: volumeDataWithAssessment, sfr: sfrData })}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            positiveCorrelations: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "positiveCorrelations", "improvementAreas"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    return JSON.parse(response.text);
};

export const getAICoachInsights = async (history: WorkoutLog[], programs: Program[], settings: Settings, bodyProgress: BodyProgressLog[], nutritionLogs: NutritionLog[]): Promise<CoachInsight> => {
    const prompt = `Analiza las últimas 4 semanas de datos de entrenamiento. Identifica tendencias, posibles estancamientos o riesgos. Proporciona un hallazgo principal, 2-3 sugerencias accionables y un alertLevel ('info', 'warning', 'danger'). Responde ÚNICAMENTE con JSON en español. Datos: ${JSON.stringify({ history: history.slice(-20) })}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            findings: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            alertLevel: { type: Type.STRING, enum: ['info', 'warning', 'danger'] }
        },
        required: ["title", "findings", "suggestions", "alertLevel"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    return JSON.parse(response.text);
};

export const getNutritionalInfo = async (description: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    const prompt = `Estima la información nutricional para: "${description}". Responde ÚNICAMENTE con un objeto JSON: { "name": "string", "calories": number, "protein": number, "carbs": number, "fats": number }, todo en español.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    const parsed = JSON.parse(response.text);
    return { ...parsed, servingSize: 1, servingUnit: 'unit', unit: 'g' };
};

export const analyzeWeeklyProgress = async (thisWeek: WorkoutLog[], lastWeek: WorkoutLog[], skipped: SkippedWorkoutLog[], settings: Settings): Promise<{ percentageChange: number; summary: string }> => {
    const prompt = `Compara el volumen de entrenamiento de esta semana con la anterior. Calcula el cambio porcentual en el volumen total (peso * reps * series). Proporciona un resumen corto y motivacional del rendimiento de la semana. Responde ÚNICAMENTE con JSON en español: { "percentageChange": number, "summary": "string" }. Datos: ${JSON.stringify({ thisWeek, lastWeek, skipped })}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            percentageChange: { type: Type.NUMBER },
            summary: { type: Type.STRING }
        },
        required: ["percentageChange", "summary"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    return JSON.parse(response.text);
};

export const generatePerformanceAnalysis = async (history: WorkoutLog[], skippedLogs: SkippedWorkoutLog[], settings: Settings): Promise<PerformanceAnalysis> => {
    const prompt = `Analiza los últimos 7 días de datos de entrenamiento. Proporciona una puntuación de rendimiento (1-7), un resumen breve, 2 puntos positivos y 2 puntos negativos/de mejora. Responde ÚNICAMENTE con JSON en español: { "score": number, "summary": "string", "positivePoints": ["string"], "negativePoints": ["string"] }. Datos: ${JSON.stringify({ workouts: history.slice(-10), skipped: skippedLogs })}`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            negativePoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "summary", "positivePoints", "negativePoints"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    return JSON.parse(response.text);
};

export const generateWeekFromPrompt = async (program: Program, prompt: string, settings: Settings): Promise<Omit<ProgramWeek, 'id'>> => {
    const context = `Contexto del programa actual: ${program.name}. Sesiones de la última semana: ${JSON.stringify(program.macrocycles.slice(-1)[0].mesocycles.slice(-1)[0].weeks.slice(-1)[0]?.sessions.map(s => s.name) || 'N/A')}`;
    const systemInstruction = `Eres un experto entrenador de fitness. Crea una nueva semana de entrenamientos basada en el objetivo del usuario, usando el contexto proporcionado para aplicar sobrecarga progresiva. Responde ÚNICAMENTE con un objeto JSON en español: { "name": "Nombre de la Semana", "sessions": [{ "name": "Nombre de la Sesión", "description": "...", "exercises": [...] }] }. La estructura de los ejercicios debe ser la misma que en generateSession.`;
    const fullPrompt = `${context}\n\nObjetivo del Usuario: ${prompt}`;
    const response = await makeGenerateContentRequest(fullPrompt, { responseMimeType: 'application/json', systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const getCoachChatResponseStream = async function* (
    prompt: string,
    messages: ChatMessage[],
    programs: Program[],
    history: WorkoutLog[],
    settings: Settings
): AsyncGenerator<GenerateContentResponse> {
    yield* generateContentStream(messages, "Eres un entrenador de fitness servicial y alentador. Responde en español.", settings);
};

export const getPhysicalProgressChatResponseStream = async function* (
    prompt: string,
    messages: ChatMessage[],
    bodyProgress: BodyProgressLog[],
    nutritionLogs: NutritionLog[],
    settings: Settings
): AsyncGenerator<GenerateContentResponse> {
    yield* generateContentStream(messages, "Eres un entrenador de nutrición y progreso servicial. Responde en español.", settings);
};

export const getPeriodizationCoachStream = async function* (
    prompt: string,
    messages: ChatMessage[],
    settings: Settings
): AsyncGenerator<GenerateContentResponse> {
    yield* generateContentStream(messages, "Eres un entrenador experto especializado en periodización del entrenamiento de fuerza. Responde en español.", settings);
};

export const analyzeMealPhoto = async (base64Image: string, settings: Settings): Promise<Omit<FoodItem, 'id'>> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image
        }
    };
    const prompt = "Analiza esta imagen de comida. Estima la información nutricional. Responde ÚNICAMENTE con un objeto JSON: { \"name\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fats\": number }, todo en español.";
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
    };
    const response = await makeGenerateContentRequest({ parts: [imagePart, { text: prompt }] }, { responseMimeType: 'application/json', responseSchema: schema }, settings);
    const parsed = JSON.parse(response.text);
    return { ...parsed, servingSize: 1, servingUnit: 'unit', unit: 'g' };
};

export const analyzeExerciseMuscles = async (exerciseName: string, settings: Settings): Promise<{ involvedMuscles: any[] }> => {
    const prompt = `Analiza el ejercicio "${exerciseName}". Enumera los músculos involucrados, su rol (primary, secondary, stabilizer) y un porcentaje estimado de activación (0.0-1.0). Responde ÚNICAMENTE con un objeto JSON: { "involvedMuscles": [{ "muscle": "string", "role": "primary"|"secondary"|"stabilizer", "activation": number }] }. Nombres de músculos en español.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const getAICoachAnalysis = async (exerciseName: string, settings: Settings): Promise<any> => {
    const prompt = `Analiza el ejercicio "${exerciseName}". Proporciona un resumen breve, una lista de pros y una lista de contras. Responde ÚNICAMENTE con JSON en español: { "summary": "string", "pros": ["string"], "cons": ["string"] }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const getAIGlobalRating = async (exerciseName: string, settings: Settings): Promise<{ score: number }> => {
    const prompt = `Califica el ejercicio "${exerciseName}" del 1 al 5 basándote en su efectividad general para hipertrofia y fuerza. Responde ÚNICAMENTE con JSON: { "score": number }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const generateExerciseAlias = async (exerciseName: string, settings: Settings): Promise<{ alias: string }> => {
    const prompt = `Genera un alias corto y común para el ejercicio "${exerciseName}" (ej. "Press Banca" -> "Bench"). Responde ÚNICAMENTE con JSON: { "alias": "string" }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const getPrimeStarsRating = async (exerciseName: string, settings: Settings): Promise<{ score: number; justification: string; }> => {
    const prompt = `Califica el ejercicio "${exerciseName}" con "Prime Stars" (1-5) basándote en su curva de resistencia, estabilidad y potencial de hipertrofia. Justifica brevemente. Responde ÚNICAMENTE con JSON en español: { "score": number, "justification": "string" }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const generateTimeSaverSuggestions = async (remainingExercises: Exercise[], timeAvailable: number, settings: Settings): Promise<{ suggestions: any[] }> => {
    const prompt = `Me quedan ${timeAvailable} minutos y estos ejercicios: ${remainingExercises.map(e => e.name).join(', ')}. Sugiere formas de ahorrar tiempo (superseries, dropsets, myo-reps, eliminar accesorios). Responde ÚNICAMENTE con JSON en español: { "suggestions": [{ "title": "string", "description": "string", "changes": [] }] }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const generateExerciseDescription = async (exerciseName: string, settings: Settings): Promise<string> => {
    const prompt = `Escribe una descripción breve y técnica del ejercicio "${exerciseName}". Responde ÚNICAMENTE con el texto de la descripción en español.`;
    const response = await makeGenerateContentRequest(prompt, {}, settings);
    return response.text;
};

export const generateMuscleGroupAnalysis = async (muscleName: string, trainingData: any, settings: Settings): Promise<MuscleGroupAnalysis> => {
    const prompt = `Analiza mi entrenamiento reciente para el grupo muscular "${muscleName}". Datos: ${JSON.stringify(trainingData)}. Evalúa el volumen, frecuencia y progreso. Responde ÚNICAMENTE con JSON en español: { "assessment": "Subentrenado"|"Optimo"|"Sobrecargado", "summary": "string", "recommendations": ["string"], "frequency": number, "volumeTrend": number, "loadProgression": number }.`;
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(response.text);
};

export const generateExerciseProgressReport = async (exerciseName: string, exerciseLogs: WorkoutLog[], settings: Settings): Promise<{ summary: string; positives: string[]; areasForImprovement: string[] }> => {
    const systemInstruction = `Eres "Prime Coach", un analista de rendimiento experto. Analiza el historial de un ejercicio específico para un atleta y proporciona un informe conciso y motivador. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON en español con el schema proporcionado. No añadas explicaciones ni texto fuera del JSON.`;
    
    const relevantData = exerciseLogs.map(log => ({
        date: log.date,
        sets: log.completedExercises.find(ex => ex.exerciseName.toLowerCase() === exerciseName.toLowerCase())?.sets
            .map(s => `${s.weight || 0}${settings.weightUnit} x ${s.completedReps || 0}r @ RPE ${s.completedRPE || 'N/A'}`)
            .join(', ')
    }));

    const prompt = `
        Analiza mi progreso para el ejercicio "${exerciseName}". Aquí están mis últimos registros para este ejercicio:
        ${JSON.stringify(relevantData)}

        **Instrucciones:**
        1.  **summary:** Escribe un resumen de 2-3 frases sobre mi tendencia general. ¿Estoy progresando en fuerza (1RM estimado), en volumen, o me he estancado?
        2.  **positives:** Menciona 1-2 puntos positivos específicos que observes. Ejemplos: "Incremento constante en el 1RM estimado", "Mejora en el número de repeticiones con el mismo peso", "Buen aumento de volumen en las últimas sesiones".
        3.  **areasForImprovement:** Menciona 1-2 áreas de mejora o sugerencias. Ejemplos: "El 1RM estimado se ha estancado en las últimas 2 sesiones, considera una semana de descarga o cambiar el rango de repeticiones", "Intenta aumentar el peso en la próxima sesión, incluso si bajas una repetición", "Tu volumen ha bajado, asegúrate de completar todas las series".
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            positives: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "positives", "areasForImprovement"]
    };

    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};


export const generateExercisesForPurpose = async (purpose: string, settings: Settings): Promise<{ exercises: { name: string; justification: string; primaryMuscles: string[] }[] }> => {
    const systemInstruction = `Eres un experto preparador físico (Strength and Conditioning Coach). Tu tarea es seleccionar ejercicios clave para un objetivo de entrenamiento específico. Sé preciso y fundamenta tus elecciones. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON en español con el schema proporcionado.`;
    const prompt = `Para el siguiente objetivo de entrenamiento: "${purpose}", selecciona 5-7 ejercicios fundamentales. Incluye una mezcla de categorías (fuerza, potencia, pliometría, resistencia) si es apropiado para el objetivo. Para cada ejercicio, proporciona su nombre, una justificación concisa de por qué es crucial para este objetivo, y una lista de los músculos primarios que trabaja.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            exercises: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'El nombre completo del ejercicio.' },
                        justification: { type: Type.STRING, description: 'Una explicación breve y experta de por qué este ejercicio es clave para el objetivo.' },
                        primaryMuscles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Una lista de los 1-3 músculos principales trabajados.'
                        }
                    },
                    required: ["name", "justification", "primaryMuscles"]
                }
            }
        },
        required: ["exercises"]
    };

    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const getNutritionalInfoForPantryItem = async (itemName: string, settings: Settings): Promise<{ name: string; calories: number; protein: number; carbs: number; fats: number; }> => {
    const systemInstruction = "Eres un asistente de nutrición. Estima la información nutricional por cada 100g para el alimento solicitado. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON.";
    const prompt = `Estima la información nutricional (calorías, proteína, carbohidratos, grasas) por cada 100g para el siguiente alimento: "${itemName}".`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const generateMealSuggestion = async (pantryItems: PantryItem[], remainingMacros: { calories: number; protein: number; carbs: number; fats: number; }, settings: Settings): Promise<{ suggestions: any[] }> => {
    const systemInstruction = "Eres un planificador de dietas. Sugiere combinaciones de comidas para alcanzar los macros restantes. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON.";
    const prompt = `Tengo los siguientes alimentos en mi despensa (info por 100g): ${JSON.stringify(pantryItems)}. Mis macros restantes para hoy son: ${JSON.stringify(remainingMacros)}. Sugiere 2-3 combinaciones de comidas diferentes usando solo estos alimentos, con cantidades específicas en gramos para cada uno, para ayudarme a alcanzar mis objetivos.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        mealName: { type: Type.STRING },
                        foods: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    grams: { type: Type.NUMBER },
                                },
                                required: ["name", "grams"],
                            },
                        },
                        totalMacros: {
                            type: Type.OBJECT,
                            properties: {
                                calories: { type: Type.NUMBER },
                                protein: { type: Type.NUMBER },
                                carbs: { type: Type.NUMBER },
                                fats: { type: Type.NUMBER },
                            },
                             required: ["calories", "protein", "carbs", "fats"],
                        },
                    },
                     required: ["mealName", "foods", "totalMacros"],
                }
            }
        },
        required: ["suggestions"],
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};


export const generateWorkoutPostSummary = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ title: string; summary: string }> => {
    const systemInstruction = `Eres "Prime Coach", un compañero de entrenamiento extremadamente detallista, motivador y perspicaz que acaba de observar mi sesión. Tu tono es cercano, informado y alentador, como si hubieras estado a mi lado contando cada repetición. Tu tarea es escribir un resumen detallado y atractivo de mi entrenamiento para mi feed personal, en español. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON con esta estructura: { "title": "string", "summary": "string en formato Markdown" }. No añadas explicaciones ni texto fuera del JSON.`;

    // Helper to find previous PR
    const findPreviousPR = (exerciseId: string, exerciseName: string): number => {
        let historicalMax1RM = 0;
        previousLogs.forEach(prevLog => {
            const prevEx = prevLog.completedExercises.find(pe => pe.exerciseId === exerciseId || pe.exerciseName === exerciseName);
            if (prevEx) {
                const prevMaxSet1RM = Math.max(...prevEx.sets.map(s => calculateBrzycki1RM(s.weight || 0, s.completedReps || 0)));
                if (prevMaxSet1RM > historicalMax1RM) {
                    historicalMax1RM = prevMaxSet1RM;
                }
            }
        });
        return historicalMax1RM;
    };

    const highlights = log.completedExercises.map(ex => {
        const currentMax1RM = Math.max(...ex.sets.map(s => calculateBrzycki1RM(s.weight || 0, s.completedReps || 0)));
        const previousPR = findPreviousPR(ex.exerciseId, ex.exerciseName);
        let performance = 'estable';
        if (currentMax1RM > previousPR && previousPR > 0) {
            performance = '¡Nuevo Récord Personal!';
        } else if (currentMax1RM > 0 && previousPR === 0) {
            performance = '¡Primer registro sólido!';
        }
        return { name: ex.exerciseName, e1RM: currentMax1RM.toFixed(1), performance };
    }).sort((a, b) => parseFloat(b.e1RM) - parseFloat(a.e1RM));

    const prompt = `
        Analiza este registro de entrenamiento y los datos históricos para crear un título y un resumen para mi feed. Sigue estas instrucciones al pie de la letra:

        1.  **Título:** Crea un título motivador y específico para la sesión: "${log.sessionName}".
        2.  **Párrafo de Apertura:** Comienza con una frase enérgica que resuma la sesión. Menciona el nombre del programa ("${log.programName}") y la sesión ("${log.sessionName}").
        3.  **Análisis de Rendimiento:**
            *   Identifica el **levantamiento más pesado** de la sesión (el 1RM estimado más alto) y menciónalo con entusiasmo.
            *   Busca y celebra **cualquier Récord Personal (PR)**. Compara el 1RM estimado de hoy con los registros anteriores para el mismo ejercicio. ¡Sé específico! Di algo como: "¡Brutal ese nuevo PR en ${highlights.find(h => h.performance.includes('Récord'))?.name || 'ejercicio'}, pasando de X a ${highlights.find(h => h.performance.includes('Récord'))?.e1RM} kg!".
            *   Menciona 1 o 2 otros ejercicios donde también hubo un buen rendimiento.
        4.  **Comentarios sobre la Ejecución:**
            *   Si hay notas en \`planDeviations\`, coméntalas de forma natural. Por ejemplo, si se sustituyó un ejercicio, di: "Vi que cambiaste X por Y, ¡una gran decisión para atacar el músculo desde otro ángulo!".
            *   Menciona el **volumen total** de la sesión. Para calcularlo, suma (peso * reps) para cada serie. IMPORTANTE: Si un ejercicio usa peso corporal (tendrá la bandera 'useBodyweight: true'), su volumen por serie es ((mi peso corporal) + peso_de_la_serie) * reps. Mi peso corporal es ${settings.userVitals?.weight || 75} ${settings.weightUnit}. Si 'useBodyweight' es true y el peso_de_la_serie es 0, significa que se usó solo el peso corporal.
            *   Comenta sobre mis niveles de **fatiga (${log.fatigueLevel}/10)** y **claridad mental (${log.mentalClarity}/10)**, integrándolo en el texto. Ej: "Terminaste con una fatiga de ${log.fatigueLevel}, ¡señal de que lo diste todo pero con buena recuperación!".
        5.  **Cierre:** Termina con una frase motivadora y con visión de futuro, preparándome para la siguiente sesión.
        6.  **Calorías:** Si el campo \`caloriesBurned\` es mayor que cero, menciónalo en alguna parte del resumen.

        **Mis Datos de Entrenamiento:**
        - Log Actual: ${JSON.stringify(log)}
        - Highlights de Rendimiento y PRs calculados: ${JSON.stringify(highlights)}
        - Registros Anteriores de la Misma Sesión (para comparación): ${JSON.stringify(previousLogs.slice(-3))}
    `;
    
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', systemInstruction }, settings);
    try {
        const parsed = JSON.parse(result.text);
        if (parsed && typeof parsed.title === 'string' && typeof parsed.summary === 'string') {
            return parsed;
        }
        return { title: "Sesión Completada", summary: "¡Buen trabajo hoy!" };
    } catch {
        return { title: "Sesión Completada", summary: "¡Buen trabajo hoy!" };
    }
};

export const generateContent = async (
    prompt: string,
    systemInstruction: string | undefined,
    jsonResponseSchema: any,
    settings: Settings
): Promise<{ text: string }> => {
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (jsonResponseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = jsonResponseSchema;
    }
    
    const result = await makeGenerateContentRequest(prompt, config, settings);
    return { text: result.text };
};

export const generateContentStream = async function*(
    messages: ChatMessage[],
    systemInstruction: string | undefined,
    settings: Settings
): AsyncGenerator<{ text: string }> {
    const contents: Content[] = messages.map(m => ({
        role: m.role,
        parts: m.parts.map(p => ({ text: p.text }))
    }));
    
    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;

    const stream = await makeGenerateContentStreamRequest(contents, config, settings);
    for await (const chunk of stream) {
        yield { text: chunk.text };
    }
};

export const generateImages = async (prompt: string, settings: Settings): Promise<{ base64Image: string }> => {
    if (!navigator.onLine) {
        throw new Error("Estás sin conexión. Esta función requiere acceso a internet.");
    }
    try {
        const client = getClient(settings);
        const response = await client.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                outputMimeType: 'image/jpeg'
            }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("La IA no pudo generar una imagen para este prompt.");
        }

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return { base64Image: `data:image/jpeg;base64,${base64ImageBytes}` };
    } catch (error) {
        console.error("Error en la solicitud de imagen a Gemini:", error);
        throw error;
    }
};

export const analyzeExerciseVideo = async (base64Video: string, exerciseName: string, settings: Settings): Promise<{ positives: string[], improvements: string[] }> => {
    const videoPart = {
        inlineData: {
            mimeType: 'video/webm', // Assuming webm from videoService
            data: base64Video,
        },
    };
    const textPart = {
        text: `Analiza mi técnica para el ejercicio "${exerciseName}". Proporciona una respuesta JSON en español con dos claves: "positives" (puntos positivos) y "improvements" (puntos de mejora), cada una con un array de strings con feedback específico.`,
    };

    const result = await makeGenerateContentRequest({ parts: [videoPart, textPart] }, { responseMimeType: 'application/json' }, settings);
    return JSON.parse(result.text);
};

export const getCommunityHighlights = async (settings: Settings): Promise<{ highlights: { title: string, url: string }[] }> => {
    const prompt = "Cuáles son los temas de actualidad, discusiones de tendencia y nuevos ejercicios populares en la comunidad de fitness en línea en español? Encuentra 3-4 artículos o publicaciones interesantes en español.";
    const result = await makeGenerateContentRequest(prompt, { tools: [{ googleSearch: {} }] }, settings);
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const highlights = groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Untitled',
        url: chunk.web?.uri || '',
    })).filter((h: any) => h.url) || [];
    return { highlights: highlights.slice(0, 4) };
};

export const generateWeightProjection = async (
    avgIntake: number,
    tdee: number,
    weightHistory: { date: string, weight?: number }[],
    targetWeight: number,
    settings: Settings
): Promise<{ projection: string; summary: string }> => {
    const systemInstruction = `Eres "Prime Coach", un analista de datos de fitness. Tu tarea es proyectar cuándo un atleta alcanzará su peso objetivo basándose en su ingesta calórica, gasto energético y progreso reciente. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON en español.`;
    const prompt = `
        Analiza mis datos para proyectar cuándo alcanzaré mi peso objetivo.
        - Mi ingesta calórica promedio de los últimos 30 días es: ${avgIntake.toFixed(0)} kcal.
        - Mi Gasto Energético Diario Total (TDEE) estimado es: ${tdee.toFixed(0)} kcal.
        - Mi historial de peso reciente es: ${JSON.stringify(weightHistory)}
        - Mi peso objetivo es: ${targetWeight} ${settings.userVitals?.weight ? settings.weightUnit : 'kg'}.
        - Mi peso actual es: ${settings.userVitals?.weight} ${settings.userVitals?.weight ? settings.weightUnit : 'kg'}.

        **Instrucciones:**
        1.  **projection:** Proporciona una fecha estimada o un rango de tiempo (ej: "En aproximadamente 4 semanas", "Alrededor del 15 de Octubre").
        2.  **summary:** Escribe un resumen de 1-2 frases explicando la proyección. Considera si mi déficit/superávit calórico actual es sostenible y realista.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            projection: { type: Type.STRING },
            summary: { type: Type.STRING }
        },
        required: ["projection", "summary"]
    };
    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const searchGoogleImages = async (query: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
    const prompt = `Find up to 8 high-quality, royalty-free images clearly showing "${query}". Prioritize direct image URLs (ending in .jpg, .png, .webp).`;
    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                imageUrls: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A direct URL to an image."
                    },
                    description: "A list of direct URLs to images found on the web."
                }
            },
            required: ["imageUrls"]
        }
    };

    const result = await makeGenerateContentRequest(prompt, config, settings);
    try {
        const parsed = JSON.parse(result.text.trim());
        if (parsed && Array.isArray(parsed.imageUrls)) {
            return { imageUrls: parsed.imageUrls };
        }
        return { imageUrls: [] };
    } catch (error) {
        console.error("Failed to parse image search results:", error);
        return { imageUrls: [] };
    }
};

export const searchWebForExerciseImages = async (exerciseName: string, settings: Settings): Promise<{ imageUrls: string[] }> => {
    const prompt = `Encuentra 3 URLs directas a imágenes de alta calidad del ejercicio "${exerciseName}". Responde ÚNICAMENTE con un array JSON de strings, como ["url1", "url2", "url3"].`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    try {
        const imageUrls = JSON.parse(result.text);
        return { imageUrls: Array.isArray(imageUrls) ? imageUrls.slice(0, 3) : [] };
    } catch {
        return { imageUrls: [] }; // Return empty if parsing fails
    }
};

export const searchWebForExerciseVideos = async (exerciseName: string, settings: Settings): Promise<{ videoUrls: string[] }> => {
    const prompt = `Encuentra 3 URLs directas a videos de alta calidad (YouTube, etc.) demostrando el ejercicio "${exerciseName}". Responde ÚNICAMENTE con un array JSON de strings, como ["url1", "url2", "url3"].`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    try {
        const videoUrls = JSON.parse(result.text);
        return { videoUrls: Array.isArray(videoUrls) ? videoUrls.slice(0, 3) : [] };
    } catch {
        return { videoUrls: [] }; // Return empty if parsing fails
    }
};

export const getCommunityOpinionForExercise = async (exerciseName: string, settings: Settings): Promise<string[]> => {
    const prompt = `Resume opiniones comunes de la comunidad de fitness, consejos o debates sobre el ejercicio "${exerciseName}". Proporciona 3-4 puntos en una lista. Responde ÚNICAMENTE con un objeto JSON en español con una clave "opinions" que contenga un array de strings, como {"opinions": ["punto 1", "punto 2"]}.`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    try {
        const parsed = JSON.parse(result.text);
        if (parsed && Array.isArray(parsed.opinions)) {
            return parsed.opinions;
        }
        return [];
    } catch {
        return [];
    }
};

export const generateSessionScore = async (log: WorkoutLog, previousLogs: WorkoutLog[], settings: Settings): Promise<{ score: number }> => {
    const systemInstruction = `Eres un experto entrenador de fitness. Analiza el registro de entrenamiento proporcionado y compáralo con los registros anteriores para la misma sesión. Considera mejoras en el volumen total, 1RM estimado en levantamientos clave, RPE/RIR para pesos similares, el feedback de calidad técnica/carga articular del usuario, y su nivel de preparación (readiness). Basado en un análisis holístico, asigna una única "score" (puntuación) de rendimiento del 1 al 10. Responde ÚNICAMENTE con un objeto JSON: { "score": number }.`;
    
    const prompt = `Analiza este entrenamiento y califícalo del 1 al 10.
    - Log Actual: ${JSON.stringify(log)}
    - Logs Anteriores (para comparación): ${JSON.stringify(previousLogs.slice(-3))}
    `;
    
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', systemInstruction }, settings);
    try {
        const parsed = JSON.parse(result.text);
        if (parsed && typeof parsed.score === 'number') {
            return { score: Math.max(1, Math.min(10, Math.round(parsed.score))) };
        }
        return { score: 5 };
    } catch {
        return { score: 5 };
    }
};

export const generateOnThisDayMessage = async (exerciseName: string, oldSet: { weight: number; reps: number }, newSet: { weight: number; reps: number }, settings: Settings): Promise<{ message: string }> => {
    const prompt = `Hace un año, un atleta levantó ${oldSet.weight}kg x ${oldSet.reps} reps en ${exerciseName}. Hoy, su mejor marca es ${newSet.weight}kg x ${newSet.reps} reps. Escribe un mensaje corto (1-2 frases), impactante y motivacional en español celebrando este progreso a largo plazo. Responde ÚNICAMENTE con un objeto JSON: { "message": "string" }.`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    try {
        const parsed = JSON.parse(result.text);
        return parsed;
    } catch {
        return { message: "¡Un año de progreso increíble! Sigue así." };
    }
};

export const suggestExerciseAlternatives = async (exercise: Exercise, reason: string, primaryMuscle: string, settings: Settings): Promise<{ alternatives: { name: string; justification: string }[] }> => {
    const prompt = `El usuario quiere sustituir el ejercicio '${exercise.name}' (un movimiento para ${primaryMuscle}) porque '${reason}'. Sugiere 3 alternativas inteligentes. Para cada una, proporciona un 'name' y una 'justification' breve en español. Responde ÚNICAMENTE con un objeto JSON: { "alternatives": [{ "name": "string", "justification": "string" }] }.`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
     try {
        const parsed = JSON.parse(result.text);
        return parsed;
    } catch {
        return { alternatives: [] };
    }
};

export const estimateSFR = async (exerciseName: string, settings: Settings): Promise<{ score: number; justification: string }> => {
    const prompt = `Estima el Ratio Estímulo-Fatiga (SFR) para el ejercicio "${exerciseName}" en una escala de 1-10. Un 10 significa altísimo estímulo con muy poca fatiga sistémica (ej. curl de bíceps en polea). Un 1 significa altísima fatiga para un estímulo localizado bajo (ej. burpees hasta el fallo). Un movimiento como el Peso Muerto Convencional tendría un SFR de 3-4. Considera la carga neural, el daño muscular y el estrés articular. Responde ÚNICAMENTE con un objeto JSON en español: { "score": number, "justification": "string" }.`;
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json' }, settings);
    try {
        const parsed = JSON.parse(result.text);
        if (parsed && typeof parsed.score === 'number' && typeof parsed.justification === 'string') {
            return parsed;
        }
        return { score: 5, justification: 'No se pudo analizar.' };
    } catch {
        return { score: 5, justification: 'No se pudo analizar.' };
    }
};

export const generateImprovementSuggestions = async (history: WorkoutLog[], programs: Program[], settings: Settings): Promise<ImprovementSuggestion[]> => {
    const systemInstruction = `Eres "Prime Coach", un entrenador de élite. Analiza el historial y programas del usuario y proporciona 3 sugerencias de mejora. Responde SIEMPRE y ÚNICAMENTE con un array JSON de objetos en español. Cada objeto debe tener esta estructura: { "title": "string", "suggestion": "string", "category": "Progression" | "Volume" | "Intensity" | "Recovery" }.`;
    
    const recentHistory = history.slice(-20);

    const prompt = `
        Analiza mis datos y dame 3 sugerencias para mejorar mi entrenamiento.

        **Mis Programas Actuales:**
        ${JSON.stringify(programs.map(p => ({ name: p.name, description: p.description })))}

        **Mi Historial de Entrenamiento Reciente (últimos ${recentHistory.length} registros):**
        ${JSON.stringify(recentHistory.map(log => ({
            sessionName: log.sessionName,
            date: log.date,
            fatigue: log.fatigueLevel,
            clarity: log.mentalClarity,
            exercises: log.completedExercises.map(ex => ({
                name: ex.exerciseName,
                sets: ex.sets.map(s => `[${s.weight || 0}${settings.weightUnit} x ${s.completedReps || 0}r @ RPE ${s.completedRPE || 'N/A'}]`).join(' ')
            }))
        })))}

        **Instrucciones para el análisis:**
        1.  **Progresión:** Busca ejercicios clave (básicos como sentadilla, press banca, peso muerto, remos) donde el 1RM estimado o el volumen (peso * reps) se haya estancado durante varias sesiones.
        2.  **Volumen:** Evalúa si el volumen para ciertos grupos musculares parece desequilibrado o si es demasiado bajo/alto para los objetivos implícitos.
        3.  **Intensidad:** Observa los RPE/RIR registrados. ¿Son consistentemente demasiado bajos para un bloque de hipertrofia? ¿O quizás demasiado altos sin una descarga planificada?
        4.  **Sugerencias:** Deben ser específicas. No digas "aumenta el peso". Di "En tu Press de Banca, has usado 80kg para 8 repeticiones en las últimas 3 sesiones. Intenta aumentar a 82.5kg la próxima semana, aunque bajes a 6 repeticiones."

        Genera 3 sugerencias basadas en estos puntos.
    `;
    
    const result = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', systemInstruction }, settings);
    try {
        const parsed = JSON.parse(result.text);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        if (parsed && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions;
        }
        return [];
    } catch {
        return [{ title: "Error de Análisis", suggestion: "No se pudieron generar sugerencias. El formato de la respuesta de la IA fue inesperado.", category: 'Recovery' }];
    }
};

export const generateBodyLabAnalysis = async (
    programs: Program[],
    history: WorkoutLog[],
    settings: Settings
): Promise<BodyLabAnalysis> => {
    const systemInstruction = `Eres "Prime Coach", un biomecánico y entrenador de fuerza de élite. Tu tarea es analizar los datos de entrenamiento y programas de un atleta para crear un "Perfil de Atleta" detallado. Sé perspicaz, científico y motivador. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON en español que se ajuste exactamente al schema proporcionado. No añadas explicaciones ni texto fuera del JSON.`;
    
    const recentHistory = history.slice(-50); // Use last 50 workouts for context

    const prompt = `
        Analiza mis datos de entrenamiento para generar mi perfil de atleta.

        **Mis Programas:**
        ${JSON.stringify(programs.map(p => ({ name: p.name, description: p.description })))}

        **Mi Historial de Entrenamiento Reciente (últimos ${recentHistory.length} registros):**
        ${JSON.stringify(recentHistory.map(log => ({
            sessionName: log.sessionName,
            date: log.date,
            fatigue: log.fatigueLevel,
            clarity: log.mentalClarity,
            discomforts: log.discomforts,
            exercises: log.completedExercises.map(ex => ({
                name: ex.exerciseName,
                volume: ex.sets.reduce((acc, s) => acc + (s.weight || 0) * (s.completedReps || 0), 0)
            }))
        })))}
        
        **Instrucciones para el Análisis:**
        1.  **profileTitle:** Crea un título de perfil evocador y personalizado basado en las tendencias (ej: "El Especialista en Empuje", "El Maratonista del Hierro").
        2.  **profileSummary:** Un resumen de 2-3 frases sobre mi estilo de entrenamiento y estado actual.
        3.  **strongPoints:** Identifica 2-3 grupos musculares o patrones de movimiento donde muestro una fuerza o progresión consistentes. Justifica por qué.
        4.  **weakPoints:** Identifica 2-3 grupos musculares o patrones de movimiento que parecen sub-entrenados o donde el progreso es lento. Justifica por qué.
        5.  **recoveryAnalysis:** Basado en mis niveles de fatiga, claridad mental y molestias reportadas, asigna un 'score' de recuperación (1-10) y un 'summary' explicando si mi recuperación parece adecuada.
        6.  **frequencyAnalysis:** Determina si mi patrón de entrenamiento sugiere una preferencia por 'Alta', 'Baja' o 'Mixta' frecuencia y resume por qué.
        7.  **recommendations:** Proporciona 3 recomendaciones accionables y específicas para mejorar mi entrenamiento, basadas en los puntos débiles y análisis de recuperación.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            profileTitle: { type: Type.STRING },
            profileSummary: { type: Type.STRING },
            strongPoints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        muscle: { type: Type.STRING },
                        reason: { type: Type.STRING },
                    },
                    required: ["muscle", "reason"]
                }
            },
            weakPoints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        muscle: { type: Type.STRING },
                        reason: { type: Type.STRING },
                    },
                    required: ["muscle", "reason"]
                }
            },
            recoveryAnalysis: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                },
                required: ["score", "summary"]
            },
            frequencyAnalysis: {
                type: Type.OBJECT,
                properties: {
                    preferredType: { type: Type.STRING },
                    summary: { type: Type.STRING },
                },
                required: ["preferredType", "summary"]
            },
            recommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["title", "description"]
                }
            },
        },
        required: ["profileTitle", "profileSummary", "strongPoints", "weakPoints", "recoveryAnalysis", "frequencyAnalysis", "recommendations"]
    };

    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const generateBiomechanicalAnalysis = async (
    data: BiomechanicalData,
    exercises: string[],
    settings: Settings
): Promise<BiomechanicalAnalysis> => {
    const systemInstruction = `Eres un biomecánico y entrenador de fuerza de élite. Analiza los datos antropométricos de un atleta y proporciona un análisis biomecánico detallado. Sé científico, preciso y ofrece consejos prácticos. Responde SIEMPRE y ÚNICAMENTE con un objeto JSON en español que se ajuste al schema proporcionado.`;

    const prompt = `
        Analiza mis datos biomecánicos para generar un perfil y recomendaciones.

        **Mis Medidas:**
        ${JSON.stringify(data)}

        **Ejercicios de Interés (para recomendaciones específicas):**
        ${JSON.stringify(exercises)}

        **Instrucciones para el Análisis:**
        1.  **apeIndex:** Calcula el Ape Index (wingspan / height). Proporciona el valor numérico y una 'interpretation' (ej: "Positivo", "Negativo", "Neutro") y explica brevemente qué implica para levantamientos como el peso muerto o press de banca.
        2.  **advantages:** Identifica 2-3 ventajas biomecánicas basadas en mis proporciones. Por ejemplo, "Fémures cortos: ventaja en sentadilla profunda". Explica por qué.
        3.  **challenges:** Identifica 2-3 desafíos biomecánicos. Por ejemplo, "Brazos largos: desafío en press de banca". Explica por qué.
        4.  **exerciseSpecificRecommendations:** Para cada uno de los 'Ejercicios de Interés', proporciona una recomendación técnica específica basada en mis proporciones. Por ejemplo, para sentadilla con fémures largos, podrías recomendar una postura más ancha o una sentadilla barra baja.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            apeIndex: {
                type: Type.OBJECT,
                properties: {
                    value: { type: Type.NUMBER },
                    interpretation: { type: Type.STRING }
                },
                required: ["value", "interpretation"]
            },
            advantages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["title", "explanation"]
                }
            },
            challenges: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["title", "explanation"]
                }
            },
            exerciseSpecificRecommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        exerciseName: { type: Type.STRING },
                        recommendation: { type: Type.STRING }
                    },
                    required: ["exerciseName", "recommendation"]
                }
            }
        },
        required: ["apeIndex", "advantages", "challenges", "exerciseSpecificRecommendations"]
    };

    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    return JSON.parse(response.text);
};

export const generateMobilityRoutine = async (target: string, settings: Settings): Promise<MobilityExercise[]> => {
    const systemInstruction = `Eres un experto fisioterapeuta y preparador físico. Tu tarea es crear una rutina de calentamiento dinámica, breve y efectiva. Responde SIEMPRE y ÚNICAMENTE con el objeto JSON que se ajuste al schema, en español. No añadas explicaciones ni texto fuera del JSON.`;

    const prompt = `Genera una rutina de calentamiento dinámico de 5 minutos para preparar el cuerpo para un entrenamiento enfocado en: "${target}". La rutina debe consistir en 4-6 ejercicios. Incluye la duración en segundos para cada uno y una instrucción muy breve y clara.`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'Nombre del ejercicio de movilidad.' },
                duration: { type: Type.NUMBER, description: 'Duración sugerida en segundos.' },
                instruction: { type: Type.STRING, description: 'Instrucción breve y clara para realizar el ejercicio.' },
            },
            required: ["name", "duration", "instruction"]
        }
    };

    const response = await makeGenerateContentRequest(prompt, { responseMimeType: 'application/json', responseSchema: schema, systemInstruction }, settings);
    const parsed = JSON.parse(response.text);

    // The Gemini API with a schema sometimes wraps the array in an object, so we handle that.
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (typeof parsed === 'object' && parsed !== null) {
        const key = Object.keys(parsed).find(k => Array.isArray(parsed[k as keyof typeof parsed]));
        if (key) {
            return parsed[key as keyof typeof parsed];
        }
    }

    return [];
};