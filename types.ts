import React from 'react';
import { z } from 'zod';

export type View = 'home' | 'programs' | 'program-editor' | 'program-detail' | 'session-editor' | 'workout' | 'progress' | 'settings' | 'coach' | 'log-hub' | 'progress-settings' | 'achievements' | 'log-workout' | 'your-lab' | 'exercise-detail' | 'muscle-group-detail' | 'hall-of-fame' | 'body-part-detail' | 'chain-detail' | 'muscle-category' | 'training-purpose' | 'exercise-database' | 'tasks' | 'session-detail' | 'smart-meal-planner' | 'nutrition' | 'exercise-editor' | 'ai-art-studio' | 'body-lab' | 'mobility-lab' | 'athlete-profile' | 'food-database' | 'food-detail' | 'food-editor' | 'feed';

export type WeightUnit = 'kg' | 'lbs';

export interface AdvancedSetFeedback { failureType?: 'concentric' | 'eccentric' | 'technical'; isSpotterAssisted?: boolean; forcedReps?: number; painLevel?: number; }

export interface DropsetData { weight: number; reps: number; }

export interface RestPauseData { reps: number; restTime: number; }

export const CompletedSetSchema = z.object({ id: z.string(), targetReps: z.number().optional(), targetRPE: z.number().optional(), targetRIR: z.number().optional(), completedReps: z.number().optional(), completedDuration: z.number().optional(), weight: z.number().optional(), machineBrand: z.string().optional(), advancedTechnique: z.enum(['dropset', 'rest-pause', 'cluster', 'amrap', '']).optional(), completedRPE: z.number().optional(), completedRIR: z.number().optional(), isFailure: z.boolean().optional(), isIneffective: z.boolean().optional(), side: z.enum(['left', 'right']).optional(), notes: z.string().optional(), isChangeOfPlans: z.boolean().optional(), isAmrap: z.boolean().optional(), setDuration: z.number().optional(), tempo: z.string().optional(), partialReps: z.number().optional(), partialRepsCount: z.number().optional(), isPartial: z.boolean().optional(), technicalQuality: z.number().optional(), discomfortLevel: z.number().optional(), discomfortNotes: z.string().optional(), advancedFeedback: z.custom<AdvancedSetFeedback>().optional(), dropsetData: z.array(z.object({ weight: z.number(), reps: z.number() })).optional(), restPauseData: z.array(z.object({ reps: z.number(), restTime: z.number() })).optional(), dropsetCount: z.number().optional(), isRestPause: z.boolean().optional(), }); 
export type CompletedSet = z.infer<typeof CompletedSetSchema>;

export const CompletedExerciseSchema = z.object({ exerciseId: z.string(), exerciseDbId: z.string().optional(), exerciseName: z.string(), variantName: z.string().optional(), sets: z.array(CompletedSetSchema), useBodyweight: z.boolean().optional(), isBallastEnabled: z.boolean().optional(), jointLoad: z.number().optional(), technicalQuality: z.number().optional(), perceivedFatigue: z.number().optional(), painLevel: z.number().optional(), machineBrand: z.string().optional(), notes: z.string().optional(), imbalanceDetected: z.object({ weakerSide: z.enum(['left', 'right']), details: z.string(), }).optional(), media: z.array(z.string()).optional(), }); 
export type CompletedExercise = z.infer<typeof CompletedExerciseSchema>;

export const TaskSchema = z.object({ id: z.string(), title: z.string(), description: z.string().optional(), completed: z.boolean(), generatedBy: z.enum(['user', 'ai']).optional().default('user'), sourceLogId: z.string().optional(), completionCondition: z.any().optional(), completedDate: z.string().optional(), }); 
export type Task = z.infer<typeof TaskSchema>;

export const SessionBackgroundSchema = z.object({ type: z.enum(['color', 'image']), value: z.string(), style: z.object({ blur: z.number(), brightness: z.number(), }).optional(), }); 
export type SessionBackground = z.infer<typeof SessionBackgroundSchema>;

export const ExerciseSetSchema = z.object({ id: z.string(), targetReps: z.number().optional(), targetDuration: z.number().optional(), targetDistance: z.number().optional(), targetCustom: z.string().optional(), notes: z.string().optional(), targetRPE: z.number().optional(), targetRIR: z.number().optional(), targetPercentageRM: z.number().optional(), targetWeight: z.number().optional(), completedReps: z.number().optional(), weight: z.number().optional(), machineBrand: z.string().optional(), advancedTechnique: z.enum(['dropset', 'rest-pause', 'cluster', 'amrap', '']).optional(), intensityMode: z.enum(['approx', 'rpe', 'rir', 'failure', 'amrap']).optional(), consolidatedWeight: z.number().optional(), technicalWeight: z.number().optional(), isChangeOfPlans: z.boolean().optional(), isAmrap: z.boolean().optional(), isPartial: z.boolean().optional(), }); 
export type ExerciseSet = z.infer<typeof ExerciseSetSchema>;

export const BrandEquivalencyPRSchema = z.object({ weight: z.number(), reps: z.number(), e1rm: z.number(), }); 
export type BrandEquivalencyPR = z.infer<typeof BrandEquivalencyPRSchema>;

export const BrandEquivalencySchema = z.object({ brand: z.string(), pr: BrandEquivalencyPRSchema.optional(), ratio: z.number().optional(), minStack: z.number().optional(), maxStack: z.number().optional(), }); 
export type BrandEquivalency = z.infer<typeof BrandEquivalencySchema>;

export const ExerciseSchema = z.object({ id: z.string(), name: z.string(), exerciseDbId: z.string().optional(), variantName: z.string().optional(), notes: z.string().optional(), restTime: z.number(), sets: z.array(ExerciseSetSchema), isFavorite: z.boolean(), goal1RM: z.number().optional(), isSupersetStart: z.boolean().optional(), supersetRest: z.number().optional(), trainingMode: z.enum(['reps', 'percent', 'time', 'distance', 'custom']), customUnit: z.string().optional(), jokerExerciseName: z.string().optional(), periodic1RMTestEnabled: z.boolean().optional(), periodic1RMTestFrequency: z.number().optional(), incomingWeight: z.number().optional(), isUnilateral: z.boolean().optional(), useBodyweight: z.boolean().optional(), unilateralRestTime: z.number().optional(), trackTUT: z.boolean().optional(), ifi: z.number().optional(), powerliftingCategory: z.enum(['main', 'variation', 'accessory', 'isolation']).optional(), calculated1RM: z.number().optional(), brandEquivalencies: z.array(BrandEquivalencySchema).optional(), isCalibratorAmrap: z.boolean().optional(), reference1RM: z.number().optional(), prFor1RM: z.object({ weight: z.number(), reps: z.number() }).optional(), progressionMode: z.enum(['ascending', 'descending']).optional(), isBallastEnabled: z.boolean().optional(), }); 
export type Exercise = z.infer<typeof ExerciseSchema>;

export const WarmupStepSchema = z.object({ id: z.string(), name: z.string(), sets: z.number(), reps: z.string(), completed: z.boolean().optional(), }); 
export type WarmupStep = z.infer<typeof WarmupStepSchema>;

const SessionVariantSchema = z.object({ name: z.string().optional(), exercises: z.array(ExerciseSchema), });

export const SessionPartSchema = z.object({ id: z.string(), name: z.string(), exercises: z.array(ExerciseSchema), }); 
export type SessionPart = z.infer<typeof SessionPartSchema>;

export const SessionSchema = z.object({ id: z.string(), name: z.string(), nameA: z.string().optional(), description: z.string(), exercises: z.array(ExerciseSchema), parts: z.array(SessionPartSchema).optional(), dayOfWeek: z.number().optional(), warmup: z.array(WarmupStepSchema).optional(), background: SessionBackgroundSchema.optional(), sessionB: SessionVariantSchema.optional(), sessionC: SessionVariantSchema.optional(), sessionD: SessionVariantSchema.optional(), lastScore: z.object({ score: z.number(), previousScore: z.number().optional(), }).optional(), }); 
export type Session = z.infer<typeof SessionSchema>;

export const ProgramWeekSchema = z.object({ id: z.string(), name: z.string(), sessions: z.array(SessionSchema), variant: z.enum(['A', 'B', 'C', 'D']).optional(), }); 
export type ProgramWeek = z.infer<typeof ProgramWeekSchema>;

export const MesocycleSchema = z.object({ id: z.string(), name: z.string(), goal: z.enum(['Acumulación', 'Intensificación', 'Realización', 'Descarga', 'Custom']), customGoal: z.string().optional(), weeks: z.array(ProgramWeekSchema), }); 
export type Mesocycle = z.infer<typeof MesocycleSchema>;

export const MacrocycleSchema = z.object({ id: z.string(), name: z.string(), mesocycles: z.array(MesocycleSchema), }); 
export type Macrocycle = z.infer<typeof MacrocycleSchema>;

export const ProgramSchema = z.object({ id: z.string(), name: z.string(), description: z.string(), coverImage: z.string(), macrocycles: z.array(MacrocycleSchema), structure: z.enum(['simple', 'complex']).optional(), background: SessionBackgroundSchema.optional(), periodizationABCD: z.boolean().optional(), mode: z.enum(['hypertrophy', 'powerlifting']).optional(), displayMode: z.enum(['weekly', 'microcycle']).optional(), carpeDiemEnabled: z.boolean().optional(), calendarization: z.object({ enabled: z.boolean(), startDate: z.string().optional(), durationInWeeks: z.number().optional(), endDate: z.string().optional(), }).optional(), goals: z.object({ squat1RM: z.number().optional(), bench1RM: z.number().optional(), deadlift1RM: z.number().optional(), }).optional(), }); 
export type Program = z.infer<typeof ProgramSchema>;

export const PlanDeviationSchema = z.object({ type: z.enum(['added', 'removed', 'substituted', 'reorder']), details: z.string(), }); 
export type PlanDeviation = z.infer<typeof PlanDeviationSchema>;

export const WorkoutLogSchema = z.object({ id: z.string(), programId: z.string(), programName: z.string(), sessionId: z.string(), sessionName: z.string(), date: z.string(), duration: z.number().optional(), completedExercises: z.array(CompletedExerciseSchema), caloriesBurned: z.number().optional(), fatigueLevel: z.number(), mentalClarity: z.number(), discomforts: z.array(z.string()).optional(), notes: z.string().optional(), gymName: z.string().optional(), photoUri: z.string().optional(), photo: z.string().optional(), sessionVariant: z.enum(['A', 'B', 'C', 'D']).optional(), readiness: z.object({ sleepQuality: z.number(), stressLevel: z.number(), doms: z.number(), motivation: z.number(), readinessScore: z.number(), }).optional(), planDeviations: z.array(PlanDeviationSchema).optional(), focus: z.number().optional(), pump: z.number().optional(), environmentTags: z.array(z.string()).optional(), sessionDifficulty: z.number().optional(), planAdherenceTags: z.array(z.string()).optional(), sessionStressScore: z.number().optional(), isCustomPost: z.boolean().optional(), postTitle: z.string().optional(), postSummary: z.string().optional(), postPhotos: z.array(z.string()).optional(), location: z.object({ latitude: z.number(), longitude: z.number(), address: z.string().optional(), }).optional(), }); 
export type WorkoutLog = z.infer<typeof WorkoutLogSchema>;

export interface SleepLog { id: string; startTime: string; endTime: string; duration: number; isAuto?: boolean; }

export interface PostSessionFeedback { logId: string; date: string; systemicFatigue?: number; feedback: Record<string, { doms: number; jointPain: boolean; rpeRecovery?: number; notes?: string; }>; }

export interface PendingQuestionnaire { logId: string; sessionName: string; muscleGroups: string[]; scheduledTime: number; }

export type Terminology = string;

export interface Settings { soundsEnabled: boolean; weightUnit: WeightUnit; barbellWeight: number; showTimeSaverPrompt: boolean; gymName: string; cardThemeColor?: string; cardBgOpacity?: number; cardBgBlur?: number; userVitals: { age?: number; weight?: number; height?: number; gender?: 'male' | 'female' | 'other'; activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'; targetWeight?: number; bodyFatPercentage?: number; ipfPointsGoal?: number; manualBMR?: number; somatotype?: { endomorph: number, mesomorph: number, ectomorph: number }; bodyFatDistribution?: 'android' | 'gynoid' | 'even'; jointHealthNotes?: { joint: string, note: string }[]; wingspan?: number; torsoLength?: number; femurLength?: number; tibiaLength?: number; humerusLength?: number; forearmLength?: number; }; calorieGoalObjective: 'maintenance' | 'deficit' | 'surplus'; dailyCalorieGoal?: number; dailyProteinGoal?: number; dailyCarbGoal?: number; dailyFatGoal?: number; startWeekOn: number | 'lunes' | 'domingo'; remindersEnabled: boolean; reminderTime: string; autoSyncEnabled: boolean; googleClientId?: string; appBackground?: SessionBackground; enableParallax?: boolean; hapticFeedbackEnabled: boolean; showPRsInWorkout: boolean; readinessCheckEnabled: boolean; apiProvider: 'gemini' | 'deepseek' | 'gpt'; fallbackEnabled: boolean; apiKeys?: { gemini?: string; deepseek?: string; gpt?: string; }; feedSettings?: { background?: string; cardColor?: string; }; lifestyleSettings?: { sleepTime?: string; breakfastTime?: string; lunchTime?: string; dinnerTime?: string; enableSleepReminders?: boolean; enableMealReminders?: boolean; enableWeightReminders?: boolean; weeklyWeightDay?: number; }; appTheme?: 'default' | 'deep-black' | 'volt'; themePrimaryColor?: string; themeTextColor?: string; themeBgGradientStart?: string; themeBgGradientEnd?: string; themeFontFamily?: string; themeCardStyle?: 'glass' | 'solid' | 'outline'; themeCardBorderRadius?: number; themeTabBarColor?: string; workoutLoggerMode: 'simple' | 'pro'; weeklyMRV?: number; dietaryPreference?: 'vegan' | 'vegetarian' | 'keto' | 'omnivore'; micronutrientFocus?: string[]; waterIntakeGoal_L?: number; enableGlassmorphism: boolean; enableAnimations: boolean; enableGlowEffects: boolean; enableZenMode: boolean; aiVoice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'; homeWidgetOrder?: string[]; 
// Header Customization
headerText?: string;
headerStyle?: 'default' | 'gradient' | 'outline' | 'neon';
headerFontSize?: number;
headerFontWeight?: number;
headerGlowIntensity?: number;
headerCustomBgEnabled?: boolean;
headerCustomBgColor?: string;
headerBgOpacity?: number;
headerBgBlur?: number;
}

export interface SkippedWorkoutLog { id: string; date: string; programId: string; sessionId: string; sessionName: string; programName: string; reason: 'skip' | 'gym_closed' | 'vacation' | 'sick' | 'other'; notes?: string; }

export interface BodyProgressLog { id: string; date: string; weight?: number; bodyFatPercentage?: number; photos?: string[]; measurements?: { [key: string]: number }; aiInsight?: string; }

export interface FoodItem { id: string; name: string; brand?: string; servingSize: number; unit: 'g' | 'ml' | 'unit'; calories: number; protein: number; carbs: number; fats: number; isCustom?: boolean; image?: string; aiNotes?: string; micronutrients?: { name: string; amount: number; unit: string; rda?: number; }[]; fatBreakdown?: { saturated: number; monounsaturated: number; polyunsaturated: number; trans: number; }; carbBreakdown?: { fiber: number; sugar: number; }; proteinQuality?: { completeness: 'Completa' | 'Incompleta'; score?: number; details?: string; }; servingUnit?: 'g' | 'ml' | 'unit'; }

export interface LoggedFood { id: string; pantryItemId?: string; foodName: string; amount: number; unit: 'g' | 'ml' | 'unit'; calories: number; protein: number; carbs: number; fats: number; }

export interface PantryItem { id: string; name: string; calories: number; protein: number; carbs: number; fats: number; currentQuantity: number; unit: 'g' | 'ml' | 'unit'; lowStockThreshold?: number; }

export interface NutritionLog { id: string; date: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; foods?: LoggedFood[]; description?: string; calories?: number; protein?: number; carbs?: number; fats?: number; notes?: string; photo?: string; status?: 'planned' | 'consumed'; }

export interface OngoingSetData { reps?: number; duration?: number; weight: number; rpe?: number; rir?: number; isFailure?: boolean; isIneffective?: boolean; machineBrand?: string; isChangeOfPlans?: boolean; notes?: string; amrapReps?: number; setDuration?: number; tempo?: string; partialReps?: number; partialRepsCount?: number; isPartial?: boolean; technicalQuality?: number; discomfortLevel?: number; discomfortNotes?: string; advancedFeedback?: AdvancedSetFeedback; dropsetData?: DropsetData[]; dropsetCount?: number; restPauseData?: RestPauseData[]; isRestPause?: boolean; advancedTechnique?: string; }

export type SetInputState = { reps: string; weight: string; rpe: string; rir: string; isFailure: boolean; isIneffective: boolean; duration: string; notes: string; tempo: string; partialReps: string; partialRepsCount?: string; isPartial: boolean; technicalQuality: string; discomfortLevel: string; discomfortNotes: string; advancedTechnique?: string; advancedFeedback?: AdvancedSetFeedback; dropsets?: DropsetData[]; restPauses?: RestPauseData[]; isRestPause: boolean; dropsetCount?: string; }; 
export type UnilateralSetInputs = { left: SetInputState; right: SetInputState };

export interface OngoingWorkoutState { programId: string; session: Session; startTime: number; activeExerciseId: string | null; activeSetId: string | null; warmupCompleted?: { [stepId: string]: boolean }; activeMode: 'A' | 'B' | 'C' | 'D'; completedSets: Record<string, { left: OngoingSetData | null, right: OngoingSetData | null }>; dynamicWeights: Record<string, { consolidated?: number, technical?: number }>; exerciseFeedback: Record<string, any>; selectedBrands: Record<string, string>; photoUri?: string; readiness?: { sleepQuality: number; stressLevel: number; doms: number; motivation: number; readinessScore: number; }; unilateralImbalances: Record<string, { weakerSide: 'left' | 'right' }>; isCarpeDiem?: boolean; topSetAmrapState?: { exerciseId: string; status: 'pending_input' | 'pending_generation' | 'completed'; originalSession: Session; topSetResult?: CompletedSet; }; macroIndex?: number; mesoIndex?: number; weekId?: string; unilateralSetInputs?: Record<string, UnilateralSetInputs>; photo?: string; }

export interface ActiveProgramState { programId: string; status: 'active' | 'paused' | 'completed'; startDate: string; currentMacrocycleIndex: number; currentBlockIndex: number; currentMesocycleIndex: number; currentWeekId: string; }

export interface MuscleRecoveryStatus { muscleId: string; muscleName: string; hoursSinceLastSession: number; recoveryScore: number; status: 'exhausted' | 'recovering' | 'optimal' | 'fresh'; impactingFactors: string[]; effectiveSets: number; indirectSets: number; recentTonnage: number; estimatedHoursToRecovery: number; recoveryRateModifier: number; avgIntensity: number | null; fatigueEvents?: FatigueEvent[]; }

export interface CarpeDiemPlan { coachMessage: string; modifiedSessions: Session[]; }

export interface BodyLabAnalysis { profileTitle: string; profileSummary: string; strongPoints: { muscle: string; reason: string }[]; weakPoints: { muscle: string; reason: string }[]; recoveryAnalysis: { score: number; summary: string }; frequencyAnalysis: { preferredType: 'Alta' | 'Baja' | 'Mixta'; summary: string }; recommendations: { title: string; description: string }[]; }

export interface BiomechanicalData { height: number; wingspan: number; torsoLength: number; femurLength: number; tibiaLength: number; humerusLength: number; forearmLength: number; }

export interface BiomechanicalAnalysis { apeIndex: { value: number; interpretation: string; }; advantages: { title: string; explanation: string; }[]; challenges: { title: string; explanation: string; }[]; exerciseSpecificRecommendations: { exerciseName: string; recommendation: string; }[]; }

export interface MobilityExercise { name: string; duration: number; instruction: string; }

export interface MuscleGroupAnalysis { assessment: 'Subentrenado' | 'Optimo' | 'Sobrecargado'; summary: string; recommendations: string[]; frequency: number; volumeTrend: number; loadProgression: number; }

export interface CoachInsight { title: string; findings: string; suggestions: string[]; alertLevel: 'info' | 'warning' | 'danger'; }

export interface SfrData { exerciseName: string; score: number; justification: string; }

export interface MuscleVolumeAnalysis { muscleGroup: string; totalSets: number; directSets: number; indirectSets: number; frequency: number; assessment: string; }

export interface DetailedMuscleVolumeAnalysis { muscleGroup: string; totalSets: number; displayVolume: number; frequency: number; avgRestDays: number | null; directExercises: { name: string, sets: number }[]; indirectExercises: { name: string, sets: number, activationPercentage: number }[]; avgIFI: number | null; recoveryStatus: 'Óptimo' | 'En Riesgo de Sobrecarga' | 'Sub-entrenado' | 'N/A'; }

export interface ExerciseMuscleInfo { id: string; name: string; alias?: string; description: string; involvedMuscles: { muscle: string; activation: number; role: 'primary' | 'secondary' | 'stabilizer'; }[]; subMuscleGroup?: string; category: 'Fuerza' | 'Hipertrofia' | 'Resistencia' | 'Potencia' | 'Movilidad' | 'Pliometría'; type: 'Básico' | 'Accesorio' | 'Aislamiento'; equipment: 'Barra' | 'Mancuerna' | 'Máquina' | 'Peso Corporal' | 'Banda' | 'Kettlebell' | 'Polea' | 'Otro'; force: 'Empuje' | 'Tirón' | 'Bisagra' | 'Sentadilla' | 'Rotación' | 'Anti-Rotación' | 'Otro'; isCustom?: boolean; bodyPart?: 'upper' | 'lower' | 'full'; chain?: 'anterior' | 'posterior' | 'full'; isFavorite?: boolean; variantOf?: string; images?: string[]; videos?: string[]; userRating?: number; primeStars?: { score: number; justification: string; }; aiCoachAnalysis?: { summary: string; pros: string[]; cons: string[]; }; communityOpinion?: string[]; sfr?: { score: number; justification: string; }; setupTime?: number; technicalDifficulty?: number; injuryRisk?: { level: number; details: string; }; transferability?: number; recommendedMobility?: string[]; isHallOfFame?: boolean; sportsRelevance?: string[]; brandEquivalencies?: BrandEquivalency[]; calculated1RM?: number; last1RMTestDate?: string; repDebtHistory?: Record<string, number>; baseIFI?: number; ifiHistory?: { date: string, e1rm: number }[]; resistanceProfile?: { curve: 'ascendente' | 'descendente' | 'campana' | 'plana' | 'variable'; peakTensionPoint: 'estiramiento' | 'contracción' | 'medio'; description?: string; }; damageProfile?: 'stretch' | 'squeeze' | 'normal'; setupCues?: string[]; executionCues?: string[]; commonMistakes?: { mistake: string; correction: string }[]; synergisticPairing?: string[]; needsReview?: boolean; progressions?: { name: string; description: string; }[]; regressions?: { name: string; description: string; }[]; anatomicalConsiderations?: { trait: string; advice: string; }[]; periodizationNotes?: { phase: string; suitability: number; notes: string; }[]; }

export interface ExercisePlaylist { id: string; name: string; exerciseIds: string[]; }

export interface LocalSnapshot { id: string; name: string; date: string; data: { programs: Program[]; history: WorkoutLog[]; settings: Settings; 'body-progress': BodyProgressLog[]; 'nutrition-logs': NutritionLog[]; }; }

export interface ToastData { id: number; message: string; type: 'success' | 'danger' | 'achievement' | 'suggestion'; title?: string; duration?: number; }

export type GenerateContentResponse = { text: string; };

export type ChatMessage = { role: 'user' | 'model'; parts: Array<{ text: string }>; };

export interface ProgramProgressInsight { summary: string; positiveCorrelations: string[]; improvementAreas: string[]; }

export interface ImprovementSuggestion { title: string; suggestion: string; category: 'Progression' | 'Volume' | 'Intensity' | 'Recovery'; }

export interface MuscleGroupInfo { id: string; name: string; description: string; importance: { movement: string; health: string; }; volumeRecommendations: { mev: string; mav: string; mrv: string; }; coverImage?: string; recommendedExercises?: string[]; favoriteExerciseId?: string; }

export type MuscleSubGroup = string | { [key: string]: string[] };

export interface MuscleHierarchy { bodyPartHierarchy: { [key: string]: MuscleSubGroup[]; }; specialCategories: { [key: string]: string[]; }; muscleToBodyPart: { [key: string]: string }; }

export interface PerformanceAnalysis { score: number; summary: string; positivePoints: string[]; negativePoints: string[]; }

export interface GoogleUserProfile { email: string; family_name: string; given_name: string; id: string; locale: string; name: string; picture: string; verified_email: boolean; }

export interface UseGoogleDriveReturn { isSupported: boolean; isSignedIn: boolean; isAuthLoading: boolean; isSyncing: boolean; isLoading: boolean; user: GoogleUserProfile | null; lastSyncDate: string | null; signIn: () => void; signOut: () => void; syncToDrive: () => void; loadFromDrive: () => void; }

export interface WarmupExercise { id: string; name: string; description: string; category: string; duration: number; }

export interface AINutritionPlanFood { name: string; portion: string; }

export interface AINutritionPlanMeal { mealName: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' | string; foods: AINutritionPlanFood[]; totalCalories?: number; totalProtein?: number; }

export interface AINutritionPlan { sourceDocument: string; date: string; meals: AINutritionPlanMeal[]; }

export interface AIPantryMealPlanFood extends AINutritionPlanFood { grams: number; } export interface AIPantryMealPlanMeal { mealName: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' | string; foods: AIPantryMealPlanFood[]; totalMacros: { calories: number; protein: number; carbs: number; fats: number; }; } export interface AIPantryMealPlan { meals: AIPantryMealPlanMeal[]; shoppingList: string[]; }

export interface Achievement { id: string; name: string; description: string; icon: string; category: 'Consistencia' | 'Hitos' | 'Exploración' | 'Dedicación'; check: (context: any) => boolean; }

export interface AchievementUnlock { achievementId: string; date: string; }

export interface CustomExerciseModalData { exercise?: ExerciseMuscleInfo; preFilledName?: string; }

export type TabBarActions = { onCancelWorkoutPress: () => void; onFinishWorkoutPress: () => void; onTimeSaverPress: () => void; onModifyPress: () => void; onTimersPress: () => void; onPauseWorkoutPress: () => void; onLogPress: () => void; onSaveSessionPress: () => void; onAddExercisePress: () => void; onCancelEditPress: () => void; onSaveProgramPress: () => void; onSaveLoggedWorkoutPress: () => void; onAddCustomExercisePress: () => void; onAddFoodItemPress?: () => void; onCoachPress: () => void; onEditExercisePress: () => void; onAnalyzeTechniquePress: () => void; onAddToPlaylistPress: () => void; onAddToSessionPress: () => void; onCreatePostPress: () => void; onCustomizeFeedPress: () => void; };

export interface AppContextState { view: View; historyStack: { view: View; data?: any }[]; programs: Program[]; history: WorkoutLog[]; skippedLogs: SkippedWorkoutLog[]; settings: Settings; bodyProgress: BodyProgressLog[]; nutritionLogs: NutritionLog[]; pantryItems: PantryItem[]; tasks: Task[]; exercisePlaylists: ExercisePlaylist[]; muscleGroupData: MuscleGroupInfo[]; muscleHierarchy: MuscleHierarchy; exerciseList: ExerciseMuscleInfo[]; foodDatabase: FoodItem[]; unlockedAchievements: AchievementUnlock[]; isOnline: boolean; isAppLoading: boolean; installPromptEvent: any; drive: UseGoogleDriveReturn; toasts: ToastData[]; bodyLabAnalysis: BodyLabAnalysis | null; biomechanicalData: BiomechanicalData | null; biomechanicalAnalysis: BiomechanicalAnalysis | null; syncQueue: WorkoutLog[]; aiNutritionPlan: AINutritionPlan | null; activeProgramState: ActiveProgramState | null; onExerciseCreated: ((exercise: ExerciseMuscleInfo) => void) | null; pendingQuestionnaires: PendingQuestionnaire[]; postSessionFeedback: PostSessionFeedback[];

isBodyLogModalOpen: boolean; isNutritionLogModalOpen: boolean; isMeasurementsModalOpen: boolean; isStartWorkoutModalOpen: boolean; isCustomExerciseEditorOpen: boolean; isFoodEditorOpen: boolean; isFinishModalOpen: boolean; isTimeSaverModalOpen: boolean; isTimersModalOpen: boolean; isReadinessModalOpen: boolean; isAddToPlaylistSheetOpen: boolean; isWorkoutEditorOpen: boolean; isMuscleListEditorOpen: boolean; isLiveCoachActive: boolean; isLogActionSheetOpen: boolean; isWorkoutExitModalOpen: boolean; isAddPantryItemModalOpen: boolean;

activeProgramId: string | null; editingProgramId: string | null; editingSessionInfo: { programId: string; macroIndex: number; mesoIndex: number; weekId: string; sessionId?: string } | null; activeSession: Session | null; loggingSessionInfo: { programId: string; sessionId: string } | null; viewingSessionInfo: { programId: string; sessionId: string; } | null; viewingExerciseId: string | null; viewingFoodId: string | null; viewingMuscleGroupId: string | null; viewingBodyPartId: string | null; viewingChainId: string | null; viewingMuscleCategoryName: string | null; exerciseToAddId: string | null; foodItemToAdd_to_pantry: FoodItem | null; ongoingWorkout: OngoingWorkoutState | null; editingCustomExerciseData: CustomExerciseModalData | null; editingFoodData: { food?: FoodItem, preFilledName?: string } | null; pendingWorkoutForReadinessCheck: { session: Session; program: Program; weekVariant?: 'A'|'B'|'C'|'D', location?: { macroIndex: number; mesoIndex: number; weekId: string } } | null; editingWorkoutSessionInfo: { session: Session; programId: string; macroIndex: number; mesoIndex: number; weekId: string; } | null; editingCategoryInfo: { name: string, type: 'bodyPart' | 'special' } | null; pendingNavigation: { view: View, data?: any, options?: { replace?: boolean } } | null;

saveSessionTrigger: number; addExerciseTrigger: number; saveProgramTrigger: number; saveLoggedWorkoutTrigger: number; modifyWorkoutTrigger: number;

searchQuery: string; activeSubTabs: Record<string, string>; currentBackgroundOverride?: SessionBackground; restTimer: { duration: number, remaining: number, key: number, exerciseName: string, endTime: number } | null; isDirty: boolean; yourLabAction: any; pendingCoachBriefing: string | null; pendingWorkoutAfterBriefing: { session: Session; program: Program; weekVariant?: 'A'|'B'|'C'|'D'; location?: { macroIndex: number; mesoIndex: number; weekId: string; }; } | null;

sleepLogs: SleepLog[]; sleepStartTime: number | null; isGlobalVoiceActive: boolean; }

export interface AppContextDispatch { setPrograms: React.Dispatch<React.SetStateAction<Program[]>>; setHistory: React.Dispatch<React.SetStateAction<WorkoutLog[]>>; setSkippedLogs: React.Dispatch<React.SetStateAction<SkippedWorkoutLog[]>>; setSettings: (newSettings: Partial<Settings>) => void; setBodyProgress: React.Dispatch<React.SetStateAction<BodyProgressLog[]>>; setNutritionLogs: React.Dispatch<React.SetStateAction<NutritionLog[]>>; setPantryItems: React.Dispatch<React.SetStateAction<PantryItem[]>>; addOrUpdatePantryItem: (item: PantryItem) => void; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; addTask: (task: Omit<Task, 'id' | 'completed' | 'generatedBy'>) => void; addAITasks: (tasks: Omit<Task, 'id' | 'completed'>[]) => void; toggleTask: (taskId: string) => void; deleteTask: (taskId: string) => void; setExercisePlaylists: React.Dispatch<React.SetStateAction<ExercisePlaylist[]>>; addOrUpdatePlaylist: (playlist: ExercisePlaylist) => void; deletePlaylist: (playlistId: string) => void; setMuscleGroupData: React.Dispatch<React.SetStateAction<MuscleGroupInfo[]>>; updateMuscleGroupInfo: (id: string, data: Partial<MuscleGroupInfo>) => void; setMuscleHierarchy: React.Dispatch<React.SetStateAction<MuscleHierarchy>>; renameMuscleCategory: (oldName: string, newName: string) => void; renameMuscleGroup: (categoryName: string, oldName: string, newName: string) => void; updateCategoryMuscles: (categoryName: string, newMuscles: string[], type: 'bodyPart' | 'special') => void; setBodyLabAnalysis: React.Dispatch<React.SetStateAction<BodyLabAnalysis | null>>; setBiomechanicalData: (data: BiomechanicalData) => Promise<void>; setBiomechanicalAnalysis: React.Dispatch<React.SetStateAction<BiomechanicalAnalysis | null>>; setAiNutritionPlan: React.Dispatch<React.SetStateAction<AINutritionPlan | null>>; setActiveProgramState: React.Dispatch<React.SetStateAction<ActiveProgramState | null>>; setOnExerciseCreated: React.Dispatch<React.SetStateAction<((exercise: ExerciseMuscleInfo) => void) | null>>;

setInstallPromptEvent: (event: any) => void;

setIsBodyLogModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsNutritionLogModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsMeasurementsModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsStartWorkoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsFinishModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsTimeSaverModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsTimersModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsReadinessModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsAddToPlaylistSheetOpen: React.Dispatch<React.SetStateAction<boolean>>; setIsLiveCoachActive: React.Dispatch<React.SetStateAction<boolean>>; setIsLogActionSheetOpen: React.Dispatch<React.SetStateAction<boolean>>; openCustomExerciseEditor: (data?: CustomExerciseModalData) => void; closeCustomExerciseEditor: () => void; openFoodEditor: (data?: { food?: FoodItem, preFilledName?: string }) => void; closeFoodEditor: () => void; openAddPantryItemModal: (foodItem: FoodItem) => void; closeAddPantryItemModal: () => void; openMuscleListEditor: (categoryName: string, type: 'bodyPart' | 'special') => void; closeMuscleListEditor: () => void; setIsWorkoutExitModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setPendingNavigation: React.Dispatch<React.SetStateAction<AppContextState['pendingNavigation']>>;

setExerciseToAddId: React.Dispatch<React.SetStateAction<string | null>>; setPendingWorkoutForReadinessCheck: React.Dispatch<React.SetStateAction<AppContextState['pendingWorkoutForReadinessCheck']>>;

setSaveSessionTrigger: React.Dispatch<React.SetStateAction<number>>; setAddExerciseTrigger: React.Dispatch<React.SetStateAction<number>>; setSaveProgramTrigger: React.Dispatch<React.SetStateAction<number>>; setSaveLoggedWorkoutTrigger: React.Dispatch<React.SetStateAction<number>>; setModifyWorkoutTrigger: React.Dispatch<React.SetStateAction<number>>;

setSearchQuery: React.Dispatch<React.SetStateAction<string>>; setActiveSubTabs: React.Dispatch<React.SetStateAction<AppContextState['activeSubTabs']>>; setCurrentBackgroundOverride: React.Dispatch<React.SetStateAction<SessionBackground | undefined>>; setOngoingWorkout: React.Dispatch<React.SetStateAction<OngoingWorkoutState | null>>; navigateTo: (view: View, data?: any, options?: { replace?: boolean }) => void; handleBack: () => void; addToast: (message: string, type?: ToastData['type'], title?: string, duration?: number) => void; removeToast: (id: number) => void; setPendingCoachBriefing: React.Dispatch<React.SetStateAction<string | null>>; setPendingWorkoutAfterBriefing: React.Dispatch<React.SetStateAction<AppContextState['pendingWorkoutAfterBriefing']>>;

handleCreateProgram: () => void; handleEditProgram: (programId: string) => void; handleSelectProgram: (program: Program) => void; handleSaveProgram: (program: Program) => void; handleUpdateProgram: (program: Program) => void; handleDeleteProgram: (programId: string) => void;

handleAddSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void; handleEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void; handleSaveSession: (session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void; handleUpdateSessionInProgram: (session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void; handleDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void; handleCopySessionsToMeso: (programId: string, macroIndex: number, mesoIndex: number) => void;

handleStartProgram: (programId: string) => void; handlePauseProgram: () => void; handleFinishProgram: () => void; handleRestartProgram: () => void;

handleStartWorkout: (session: Session, program: Program, weekVariant?: 'A'|'B'|'C'|'D', location?: { macroIndex: number, mesoIndex: number, weekId: string }) => void; handleResumeWorkout: () => void; handleContinueFromReadiness: (data: any) => void; handleContinueWorkoutAfterBriefing: () => void; onCancelWorkout: () => void; handlePauseWorkout: () => void; handleFinishWorkout: ( completedExercises: CompletedExercise[], duration: number, notes?: string, discomforts?: string[], fatigue?: number, clarity?: number, logDate?: string, photo?: string, planDeviations?: PlanDeviation[], focus?: number, pump?: number, environmentTags?: string[], sessionDifficulty?: number, planAdherenceTags?: string[] ) => void; handleLogWorkout: (programId: string, sessionId: string) => void; handleSaveLoggedWorkout: (log: WorkoutLog) => void; handleSkipWorkout: (session: Session, program: Program, reason: 'skip' | 'gym_closed' | 'vacation' | 'sick' | 'other', notes?: string) => void;

handleSaveBodyLog: (log: BodyProgressLog) => void; handleSaveNutritionLog: (log: NutritionLog) => void; addOrUpdateFoodItem: (food: FoodItem) => void; handleUpdateExerciseInProgram: (programId: string, sessionId: string, exerciseId: string, updatedExercise: Exercise) => void; handleUpdateProgressionWeights: (exerciseId: string, consolidated?: number, technical?: number) => void; handleUpdateExercise1RM: (exerciseDbId: string | undefined, exerciseName: string, weight: number, reps: number, testDate?: string, machineBrand?: string) => void; handleUpdateExerciseBrandPR: (exerciseDbId: string, brand: string, pr: { weight: number, reps: number, e1rm: number}) => void; handleUpdateExerciseRepDebt: (exerciseDbId: string, debtUpdate: Record<string, number>) => void;

handleStartRest: (duration: number, exerciseName: string) => void; handleAdjustRestTimer: (amountInSeconds: number) => void; handleSkipRestTimer: () => void;

handleLogPress: () => void;

addOrUpdateCustomExercise: (exercise: ExerciseMuscleInfo) => void; batchAddExercises: (exercises: ExerciseMuscleInfo[]) => void; createAndAddExerciseToDB: (exerciseName: string) => Promise<ExerciseMuscleInfo | null>; setExerciseList: React.Dispatch<React.SetStateAction<ExerciseMuscleInfo[]>>; exportExerciseDatabase: () => void; importExerciseDatabase: (jsonString: string) => void;

setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;

handleModifyWorkout: () => void; handleSaveModifiedWorkout: (session: Session) => void; setIsWorkoutEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;

setYourLabAction: React.Dispatch<React.SetStateAction<any>>;

handleLogSleep: (action: 'start' | 'end') => void; setSleepLogs: React.Dispatch<React.SetStateAction<SleepLog[]>>;

handleSavePostSessionFeedback: (feedback: PostSessionFeedback) => void;

setIsGlobalVoiceActive: React.Dispatch<React.SetStateAction<boolean>>;
onCreatePostPress: () => void;
onCustomizeFeedPress: () => void;
handleUpdatePost: (log: WorkoutLog) => void; }

export interface FatigueEvent { exerciseName: string; sessionName: string; date: string; sets: number; factors: string[]; impactScore: number; }