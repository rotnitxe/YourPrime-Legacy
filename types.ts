// types.ts
import React from 'react';
import { z } from 'zod';
import { UseGoogleDriveReturn } from './hooks/useGoogleDrive';

export type View = 'home' | 'programs' | 'program-editor' | 'program-detail' | 'session-editor' | 'workout' | 'progress' | 'settings' | 'coach' | 'log-hub' | 'progress-settings' | 'achievements' | 'log-workout' | 'your-lab' | 'exercise-detail' | 'muscle-group-detail' | 'hall-of-fame' | 'body-part-detail' | 'chain-detail' | 'feed' | 'muscle-category' | 'body-lab' | 'mobility-lab' | 'training-purpose' | 'exercise-database' | 'tasks' | 'session-detail' | 'smart-meal-planner';

export type WeightUnit = 'kg' | 'lbs';

// --- Zod Schemas for Core Data Structures ---

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
});
export type Task = z.infer<typeof TaskSchema>;

export const SessionBackgroundSchema = z.object({
    type: z.enum(['color', 'image']),
    value: z.string(),
    style: z.object({
        blur: z.number(),
        brightness: z.number(),
    }).optional(),
});
export type SessionBackground = z.infer<typeof SessionBackgroundSchema>;

export const ExerciseSetSchema = z.object({
  id: z.string(),
  targetReps: z.number().optional(),
  targetDuration: z.number().optional(),
  targetDistance: z.number().optional(),
  targetCustom: z.string().optional(),
  notes: z.string().optional(),
  targetRPE: z.number().optional(),
  targetRIR: z.number().optional(),
  targetPercentageRM: z.number().optional(),
  completedReps: z.number().optional(),
  weight: z.number().optional(),
  machineBrand: z.string().optional(),
  advancedTechnique: z.enum(['dropset', 'rest-pause', 'cluster', '']).optional(),
  intensityMode: z.enum(['approx', 'rpe', 'rir', 'failure']).optional(),
  consolidatedWeight: z.number().optional(),
  technicalWeight: z.number().optional(),
  isChangeOfPlans: z.boolean().optional(),
});
export type ExerciseSet = z.infer<typeof ExerciseSetSchema>;

export const BrandEquivalencyPRSchema = z.object({
  weight: z.number(),
  reps: z.number(),
  e1rm: z.number(),
});
export type BrandEquivalencyPR = z.infer<typeof BrandEquivalencyPRSchema>;


export const BrandEquivalencySchema = z.object({
  brand: z.string(),
  pr: BrandEquivalencyPRSchema.optional(),
  ratio: z.number().optional(), // Ratio para homologar la carga con otros equipos. Se asume un valor base de 1.
  minStack: z.number().optional(),
  maxStack: z.number().optional(),
});
export type BrandEquivalency = z.infer<typeof BrandEquivalencySchema>;

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  exerciseDbId: z.string().optional(),
  variantName: z.string().optional(),
  notes: z.string().optional(),
  restTime: z.number(),
  sets: z.array(ExerciseSetSchema),
  isFavorite: z.boolean(),
  goal1RM: z.number().optional(),
  isSupersetStart: z.boolean().optional(),
  supersetRest: z.number().optional(),
  trainingMode: z.enum(['reps', 'percent', 'time', 'distance', 'custom']),
  customUnit: z.string().optional(),
  jokerExerciseName: z.string().optional(),
  periodic1RMTestEnabled: z.boolean().optional(),
  periodic1RMTestFrequency: z.number().optional(),
  incomingWeight: z.number().optional(),
  isUnilateral: z.boolean().optional(),
  useBodyweight: z.boolean().optional(),
  unilateralRestTime: z.number().optional(),
  ifi: z.number().optional(), // Individualized Fatigue Index
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const WarmupStepSchema = z.object({
    id: z.string(),
    name: z.string(),
    sets: z.number(),
    reps: z.string(),
    completed: z.boolean().optional(),
});
export type WarmupStep = z.infer<typeof WarmupStepSchema>;

const SessionVariantSchema = z.object({
  name: z.string().optional(),
  exercises: z.array(ExerciseSchema),
});

export const SessionPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  exercises: z.array(ExerciseSchema),
});
export type SessionPart = z.infer<typeof SessionPartSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  exercises: z.array(ExerciseSchema),
  parts: z.array(SessionPartSchema).optional(),
  dayOfWeek: z.number().optional(),
  warmup: z.array(WarmupStepSchema).optional(),
  background: SessionBackgroundSchema.optional(),
  nameA: z.string().optional(),
  sessionB: SessionVariantSchema.optional(),
  sessionC: SessionVariantSchema.optional(),
  sessionD: SessionVariantSchema.optional(),
  lastScore: z.object({
      score: z.number(),
      previousScore: z.number().optional(),
  }).optional(),
});
export type Session = z.infer<typeof SessionSchema>;

export const ProgramWeekSchema = z.object({
    id: z.string(),
    name: z.string(),
    sessions: z.array(SessionSchema),
    variant: z.enum(['A', 'B', 'C', 'D']).optional(),
});
export type ProgramWeek = z.infer<typeof ProgramWeekSchema>;

export const MesocycleSchema = z.object({
    id: z.string(),
    name: z.string(),
    goal: z.enum(['Acumulación', 'Intensificación', 'Realización', 'Descarga', 'Custom']),
    customGoal: z.string().optional(),
    weeks: z.array(ProgramWeekSchema),
});
export type Mesocycle = z.infer<typeof MesocycleSchema>;

export const MacrocycleSchema = z.object({
    id: z.string(),
    name: z.string(),
    mesocycles: z.array(MesocycleSchema),
});
export type Macrocycle = z.infer<typeof MacrocycleSchema>;

export const ProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  coverImage: z.string(),
  macrocycles: z.array(MacrocycleSchema),
  background: SessionBackgroundSchema.optional(),
  periodizationABCD: z.boolean().optional(),
  calendarization: z.object({
    enabled: z.boolean(),
    startDate: z.string().optional(),
    durationInWeeks: z.number().optional(),
    endDate: z.string().optional(),
  }).optional(),
});
export type Program = z.infer<typeof ProgramSchema>;

export const CompletedSetSchema = z.object({
  id: z.string(),
  targetReps: z.number().optional(),
  targetRPE: z.number().optional(),
  targetRIR: z.number().optional(),
  completedReps: z.number().optional(),
  completedDuration: z.number().optional(),
  weight: z.number().optional(),
  machineBrand: z.string().optional(),
  advancedTechnique: z.enum(['dropset', 'rest-pause', 'cluster', '']).optional(),
  completedRPE: z.number().optional(),
  completedRIR: z.number().optional(),
  isFailure: z.boolean().optional(),
  side: z.enum(['left', 'right']).optional(),
  notes: z.string().optional(),
  isChangeOfPlans: z.boolean().optional(),
});
export type CompletedSet = z.infer<typeof CompletedSetSchema>;

export const CompletedExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseDbId: z.string().optional(),
  exerciseName: z.string(),
  variantName: z.string().optional(),
  sets: z.array(CompletedSetSchema),
  useBodyweight: z.boolean().optional(),
  jointLoad: z.number().optional(),
  technicalQuality: z.number().optional(),
  perceivedFatigue: z.number().optional(), // New feedback parameter
  machineBrand: z.string().optional(),
  notes: z.string().optional(),
  imbalanceDetected: z.object({
    weakerSide: z.enum(['left', 'right']),
    details: z.string(),
  }).optional(),
});
export type CompletedExercise = z.infer<typeof CompletedExerciseSchema>;

export const PlanDeviationSchema = z.object({
  type: z.enum(['added', 'removed', 'substituted', 'volume_changed', 'reorder']),
  details: z.string(),
});
export type PlanDeviation = z.infer<typeof PlanDeviationSchema>;

export const WorkoutLogSchema = z.object({
  id: z.string(),
  programId: z.string(),
  programName: z.string(),
  sessionId: z.string(),
  sessionName: z.string(),
  date: z.string(), // ISO string
  duration: z.number().optional(),
  completedExercises: z.array(CompletedExerciseSchema),
  caloriesBurned: z.number().optional(),
  fatigueLevel: z.number(),
  mentalClarity: z.number(),
  discomforts: z.array(z.string()).optional(),
  notes: z.string().optional(),
  gymName: z.string().optional(),
  photo: z.string().optional(),
  sessionVariant: z.enum(['A', 'B', 'C', 'D']).optional(),
  readiness: z.object({
    sleepQuality: z.number(),
    stressLevel: z.number(),
    doms: z.number(),
    motivation: z.number(),
    readinessScore: z.number(),
  }).optional(),
  planDeviations: z.array(PlanDeviationSchema).optional(),
  postTitle: z.string().optional(),
  postSummary: z.string().optional(),
  postPhotos: z.array(z.string()).optional(),
  isCustomPost: z.boolean().optional(),
});
export type WorkoutLog = z.infer<typeof WorkoutLogSchema>;

// --- Other types remain unchanged for now ---

export interface Settings {
  soundsEnabled: boolean;
  weightUnit: WeightUnit;
  barbellWeight: number;
  showTimeSaverPrompt: boolean;
  gymName: string;
  headerText: string;
  headerStyle: 'default' | 'gradient' | 'outline' | 'neon';
  headerFontSize: number;
  headerFontWeight: number;
  headerGlowIntensity: number;
  headerCustomBgEnabled: boolean;
  headerCustomBgColor: string;
  headerBgOpacity: number;
  headerBgBlur: number;
  cardThemeColor?: string;
  cardBgOpacity?: number;
  cardBgBlur?: number;
  userVitals: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: 'male' | 'female' | 'other';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    targetWeight?: number;
  };
  calorieGoalObjective: 'maintenance' | 'deficit' | 'surplus';
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbGoal?: number;
  dailyFatGoal?: number;
  startWeekOn: 'lunes' | 'domingo';
  remindersEnabled: boolean;
  reminderTime: string;
  autoSyncEnabled: boolean;
  googleClientId?: string;
  appBackground?: SessionBackground;
  enableParallax?: boolean;
  hapticFeedbackEnabled: boolean;
  showPRsInWorkout: boolean;
  readinessCheckEnabled: boolean;
  apiProvider: 'gemini' | 'deepseek' | 'gpt';
  fallbackEnabled: boolean;
  apiKeys?: {
    gemini?: string;
    deepseek?: string;
    gpt?: string;
  };
  feedSettings?: {
    background?: string;
    cardColor?: string;
  };
  // Advanced Theme Settings
  themePrimaryColor?: string;
  themeTextColor?: string;
  themeBgGradientStart?: string;
  themeBgGradientEnd?: string;
  themeFontFamily?: string;
  themeCardStyle?: 'glass' | 'solid' | 'outline';
  themeCardBorderRadius?: number;
  themeTabBarColor?: string;
}

export interface SkippedWorkoutLog {
  id: string;
  date: string;
  programId: string;
  sessionId: string;
  sessionName: string;
  programName: string;
  reason: 'skip' | 'gym_closed' | 'vacation' | 'sick' | 'other';
  notes?: string;
}

export interface BodyProgressLog {
    id: string;
    date: string; // ISO date string
    weight?: number;
    bodyFatPercentage?: number;
    photos?: string[]; // Array of base64 strings or URLs
    measurements?: { [key: string]: number }; // e.g., { "chest": 100, "waist": 80 }
}

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    servingSize: number;
    servingUnit: 'g' | 'ml' | 'unidad';
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface PantryItem {
    id: string;
    name: string;
    calories: number; // per 100g
    protein: number; // per 100g
    carbs: number; // per 100g
    fats: number; // per 100g
}

export interface NutritionLog {
    id: string;
    date: string; // ISO string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    photo?: string;
}

export interface OngoingSetData {
    reps?: number;
    duration?: number;
    weight: number;
    rpe?: number;
    rir?: number;
    isFailure?: boolean;
    machineBrand?: string;
    isChangeOfPlans?: boolean;
    notes?: string;
}

export interface OngoingWorkoutState {
    programId: string;
    session: Session;
    startTime: number;
    activeExerciseId: string | null;
    activeSetId: string | null;
    warmupCompleted?: { [stepId: string]: boolean };
    activeMode: 'A' | 'B' | 'C' | 'D';
    completedSets: Record<string, { left: OngoingSetData | null, right: OngoingSetData | null }>;
    dynamicWeights: Record<string, { consolidated?: number, technical?: number }>;
    exerciseFeedback: Record<string, Omit<CompletedExercise, 'exerciseId' | 'exerciseName' | 'sets' | 'exerciseDbId' | 'useBodyweight'>>;
    selectedBrands?: Record<string, string>;
    photo?: string;
    readiness?: {
      sleepQuality: number;
      stressLevel: number;
      doms: number;
      motivation: number;
      readinessScore: number;
    };
    unilateralImbalances: Record<string, { weakerSide: 'left' | 'right' }>;
}

// --- AI Related Types ---
export interface BodyLabAnalysis {
    profileTitle: string;
    profileSummary: string;
    strongPoints: { muscle: string; reason: string }[];
    weakPoints: { muscle: string; reason: string }[];
    recoveryAnalysis: { score: number; summary: string }; // score 1-10
    frequencyAnalysis: { preferredType: 'Alta' | 'Baja' | 'Mixta'; summary: string };
    recommendations: { title: string; description: string }[];
}

export interface BiomechanicalData {
    height: number; // cm
    wingspan: number; // cm
    torsoLength: number; // cm
    femurLength: number; // cm
    tibiaLength: number; // cm
    humerusLength: number; // cm
    forearmLength: number; // cm
}

export interface BiomechanicalAnalysis {
    apeIndex: {
        value: number;
        interpretation: string;
    };
    advantages: {
        title: string;
        explanation: string;
    }[];
    challenges: {
        title: string;
        explanation: string;
    }[];
    exerciseSpecificRecommendations: {
        exerciseName: string;
        recommendation: string;
    }[];
}

export interface MobilityExercise {
  name: string;
  duration: number; // in seconds
  instruction: string;
}

export interface MuscleGroupAnalysis {
    assessment: 'Subentrenado' | 'Optimo' | 'Sobrecargado';
    summary: string;
    recommendations: string[];
    frequency: number;
    volumeTrend: number;
    loadProgression: number;
}

export interface CoachInsight {
    title: string;
    findings: string;
    suggestions: string[];
    alertLevel: 'info' | 'warning' | 'danger';
}

export interface SfrData {
    exerciseName: string;
    score: number;
    justification: string;
}

export interface MuscleVolumeAnalysis {
    muscleGroup: string;
    totalSets: number;
    directSets: number;
    indirectSets: number;
    frequency: number;
    assessment: string;
}

export interface DetailedMuscleVolumeAnalysis {
    muscleGroup: string;
    totalSets: number; // The true total for breakdowns (direct + all indirect)
    displayVolume: number; // For the main UI (direct + weighted indirect)
    frequency: number;
    avgRestDays: number | null;
    directExercises: { name: string, sets: number }[];
    indirectExercises: { name: string, sets: number, activationPercentage: number }[];
    avgIFI: number | null;
    recoveryStatus: 'Óptimo' | 'En Riesgo de Sobrecarga' | 'Sub-entrenado' | 'N/A';
}

export interface ExerciseMuscleInfo {
  id: string;
  name: string;
  alias?: string;
  description: string;
  involvedMuscles: {
      muscle: string;
      activation: number;
      role: 'primary' | 'secondary' | 'stabilizer';
  }[];
  subMuscleGroup?: string;
  category: 'Fuerza' | 'Hipertrofia' | 'Resistencia' | 'Potencia' | 'Movilidad' | 'Pliometría';
  type: 'Básico' | 'Accesorio' | 'Aislamiento';
  equipment: 'Barra' | 'Mancuerna' | 'Máquina' | 'Peso Corporal' | 'Banda' | 'Kettlebell' | 'Polea' | 'Otro';
  force: 'Empuje' | 'Tirón' | 'Bisagra' | 'Sentadilla' | 'Rotación' | 'Anti-Rotación' | 'Otro';
  isCustom?: boolean;
  bodyPart?: 'upper' | 'lower' | 'full';
  chain?: 'anterior' | 'posterior' | 'full';
  isFavorite?: boolean;
  variantOf?: string;
  images?: string[];
  videos?: string[];
  userRating?: number;
  primeStars?: {
      score: number;
      justification: string;
  };
  aiCoachAnalysis?: {
      summary: string;
      pros: string[];
      cons: string[];
  };
  communityOpinion?: string[];
  sfr?: {
      score: number;
      justification: string;
  };
  setupTime?: number;
  technicalDifficulty?: number;
  injuryRisk?: {
    level: number;
    details: string;
  };
  transferability?: number;
  recommendedMobility?: string[];
  isHallOfFame?: boolean;
  sportsRelevance?: string[];
  // Unified properties
  brandEquivalencies?: BrandEquivalency[];
  calculated1RM?: number;
  last1RMTestDate?: string;
  repDebtHistory?: Record<string, number>; // e.g., { 'reps10-rpe8': -2 }
  baseIFI?: number;
  ifiHistory?: { date: string, e1rm: number }[];
}

export interface ExercisePlaylist {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface LocalSnapshot {
  id: string;
  name: string;
  date: string; // ISO string
  data: {
    programs: Program[];
    history: WorkoutLog[];
    settings: Settings;
    'body-progress': BodyProgressLog[];
    'nutrition-logs': NutritionLog[];
  };
}

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'achievement' | 'suggestion';
  title?: string;
  duration?: number;
}

export type GenerateContentResponse = {
  text: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

export interface ProgramProgressInsight {
  summary: string;
  positiveCorrelations: string[];
  improvementAreas: string[];
}

export interface ImprovementSuggestion {
  title: string;
  suggestion: string;
  category: 'Progression' | 'Volume' | 'Intensity' | 'Recovery';
}

export interface MuscleGroupInfo {
    id: string;
    name: string;
    description: string;
    importance: {
        movement: string;
        health: string;
    };
    volumeRecommendations: {
        mev: string; // Minumum Effective Volume
        mav: string; // Maximum Adaptive Volume
        mrv: string; // Maximum Recoverable Volume
    };
    coverImage?: string;
    recommendedExercises?: string[];
    favoriteExerciseId?: string;
}

export type MuscleSubGroup = string | { [key: string]: string[] };

export interface MuscleHierarchy {
  bodyPartHierarchy: {
    [key: string]: MuscleSubGroup[];
  };
  specialCategories: {
    [key: string]: string[];
  };
  muscleToBodyPart: { [key: string]: string };
}

export interface PerformanceAnalysis {
    score: number;
    summary: string;
    positivePoints: string[];
    negativePoints: string[];
}

export interface GoogleUserProfile {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    locale: string;
    name: string;
    picture: string;
    verified_email: boolean;
}

export interface WarmupExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
}


// --- Achievements ---
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'Consistencia' | 'Hitos' | 'Exploración' | 'Dedicación';
    check: (context: any) => boolean;
}

export interface AchievementUnlock {
    achievementId: string;
    date: string; // ISO string
}

export interface CustomExerciseModalData {
    exercise?: ExerciseMuscleInfo;
    preFilledName?: string;
}

// --- App Context ---
export interface AppContextState {
  view: View;
  historyStack: { view: View; data?: any }[];
  programs: Program[];
  history: WorkoutLog[];
  skippedLogs: SkippedWorkoutLog[];
  settings: Settings;
  bodyProgress: BodyProgressLog[];
  nutritionLogs: NutritionLog[];
  pantryItems: PantryItem[];
  tasks: Task[];
  exercisePlaylists: ExercisePlaylist[];
  muscleGroupData: MuscleGroupInfo[];
  muscleHierarchy: MuscleHierarchy;
  exerciseList: ExerciseMuscleInfo[];
  unlockedAchievements: AchievementUnlock[];
  isOnline: boolean;
  isAppLoading: boolean;
  installPromptEvent: any;
  drive: UseGoogleDriveReturn;
  toasts: ToastData[];
  bodyLabAnalysis: BodyLabAnalysis | null;
  biomechanicalData: BiomechanicalData | null;
  biomechanicalAnalysis: BiomechanicalAnalysis | null;
  syncQueue: WorkoutLog[];
  
  // Modals & Sheets
  isFinishModalOpen: boolean;
  isTimeSaverModalOpen: boolean;
  isTimersModalOpen: boolean;
  isReadinessModalOpen: boolean;
  isAddToPlaylistSheetOpen: boolean;
  isCustomExerciseEditorOpen: boolean;
  isWorkoutEditorOpen: boolean;
  isMuscleListEditorOpen: boolean;
  isMeasurementsModalOpen: boolean;
  isStartWorkoutModalOpen: boolean;

  // Editing & Viewing states
  activeProgramId: string | null;
  editingProgramId: string | null;
  editingSessionInfo: { programId: string; macroIndex: number; mesoIndex: number; weekId: string; sessionId?: string } | null;
  activeSession: Session | null;
  loggingSessionInfo: { programId: string; sessionId: string } | null;
  viewingSessionInfo: { programId: string; sessionId: string; } | null;
  viewingExerciseId: string | null;
  viewingMuscleGroupId: string | null;
  viewingBodyPartId: string | null;
  viewingChainId: string | null;
  viewingMuscleCategoryName: string | null;
  exerciseToAddId: string | null;
  ongoingWorkout: OngoingWorkoutState | null;
  editingCustomExerciseData: CustomExerciseModalData | null;
  pendingWorkoutForReadinessCheck: { session: Session; program: Program; weekVariant?: 'A'|'B'|'C'|'D' } | null;
  editingWorkoutSessionInfo: { session: Session; programId: string; macroIndex: number; mesoIndex: number; weekId: string; } | null;
  editingCategoryInfo: { name: string, type: 'bodyPart' | 'special' } | null;
  
  // Triggers
  saveSessionTrigger: number;
  addExerciseTrigger: number;
  saveProgramTrigger: number;
  saveLoggedWorkoutTrigger: number;
  modifyWorkoutTrigger: number;

  // UI State
  currentBackgroundOverride?: SessionBackground;
  restTimer: { duration: number, remaining: number, key: number, exerciseName: string, endTime: number } | null;
  isDirty: boolean; // For tracking unsaved changes
  yourLabAction: any; // Legacy or for future use
}

export type TabBarActions = {
    onCancelWorkoutPress: () => void;
    onFinishWorkoutPress: () => void;
    onTimeSaverPress: () => void;
    onModifyPress: () => void;
    onTimersPress: () => void;
    onPauseWorkoutPress: () => void;
    onLogPress: () => void;
    onSaveSessionPress: () => void;
    onAddExercisePress: () => void;
    onCancelEditPress: () => void;
    onSaveProgramPress: () => void;
    onSaveLoggedWorkoutPress: () => void;
    onAddCustomExercisePress: () => void;
    onCoachPress: () => void;
    onEditExercisePress: () => void;
    onAnalyzeTechniquePress: () => void;
    onAddToPlaylistPress: () => void;
    onAddToSessionPress: () => void;
    onCreatePostPress: () => void;
    onCustomizeFeedPress: () => void;
};


export interface AppContextDispatch {
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  setHistory: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  setSkippedLogs: React.Dispatch<React.SetStateAction<SkippedWorkoutLog[]>>;
  setSettings: (newSettings: Partial<Settings>) => void;
  setBodyProgress: React.Dispatch<React.SetStateAction<BodyProgressLog[]>>;
  setNutritionLogs: React.Dispatch<React.SetStateAction<NutritionLog[]>>;
  setPantryItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  setExercisePlaylists: React.Dispatch<React.SetStateAction<ExercisePlaylist[]>>;
  addOrUpdatePlaylist: (playlist: ExercisePlaylist) => void;
  deletePlaylist: (playlistId: string) => void;
  setMuscleGroupData: React.Dispatch<React.SetStateAction<MuscleGroupInfo[]>>;
  updateMuscleGroupInfo: (id: string, data: Partial<MuscleGroupInfo>) => void;
  setMuscleHierarchy: React.Dispatch<React.SetStateAction<MuscleHierarchy>>;
  renameMuscleCategory: (oldName: string, newName: string) => void;
  renameMuscleGroup: (categoryName: string, oldName: string, newName: string) => void;
  updateCategoryMuscles: (categoryName: string, newMuscles: string[], type: 'bodyPart' | 'special') => void;
  setBodyLabAnalysis: React.Dispatch<React.SetStateAction<BodyLabAnalysis | null>>;
  setBiomechanicalData: (data: BiomechanicalData) => Promise<void>;
  setBiomechanicalAnalysis: React.Dispatch<React.SetStateAction<BiomechanicalAnalysis | null>>;
  
  setInstallPromptEvent: (event: any) => void;
  
  // Modals & Sheets
  setIsFinishModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimeSaverModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimersModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReadinessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddToPlaylistSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMeasurementsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStartWorkoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCustomExerciseEditor: (data?: CustomExerciseModalData) => void;
  closeCustomExerciseEditor: () => void;
  openMuscleListEditor: (categoryName: string, type: 'bodyPart' | 'special') => void;
  closeMuscleListEditor: () => void;
  
  setExerciseToAddId: React.Dispatch<React.SetStateAction<string | null>>;

  // Triggers
  setSaveSessionTrigger: React.Dispatch<React.SetStateAction<number>>;
  setAddExerciseTrigger: React.Dispatch<React.SetStateAction<number>>;
  setSaveProgramTrigger: React.Dispatch<React.SetStateAction<number>>;
  setSaveLoggedWorkoutTrigger: React.Dispatch<React.SetStateAction<number>>;
  setModifyWorkoutTrigger: React.Dispatch<React.SetStateAction<number>>;
  
  // UI Actions
  setCurrentBackgroundOverride: React.Dispatch<React.SetStateAction<SessionBackground | undefined>>;
  setOngoingWorkout: React.Dispatch<React.SetStateAction<OngoingWorkoutState | null>>;
  navigateTo: (view: View, data?: any, options?: { replace?: boolean }) => void;
  handleBack: () => void;
  addToast: (message: string, type?: ToastData['type'], title?: string, duration?: number) => void;
  removeToast: (id: number) => void;

  // CRUD Actions
  handleCreateProgram: () => void;
  handleEditProgram: (programId: string) => void;
  handleSelectProgram: (program: Program) => void;
  handleSaveProgram: (program: Program) => void;
  handleUpdateProgram: (program: Program) => void;
  handleDeleteProgram: (programId: string) => void;
  
  handleAddSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
  handleEditSession: (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => void;
  handleSaveSession: (session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
  handleUpdateSessionInProgram: (session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;
  handleDeleteSession: (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => void;

  handleStartWorkout: (session: Session, program: Program, weekVariant?: 'A'|'B'|'C'|'D') => void;
  handleResumeWorkout: () => void;
  handleContinueFromReadiness: (data: any) => void;
  onCancelWorkout: () => void;
  handlePauseWorkout: () => void;
  handleFinishWorkout: (completedExercises: CompletedExercise[], duration: number, notes?: string, discomforts?: string[], fatigue?: number, clarity?: number, logDate?: string, photo?: string, planDeviations?: PlanDeviation[]) => void;
  handleLogWorkout: (programId: string, sessionId: string) => void;
  handleSaveLoggedWorkout: (log: WorkoutLog) => void;
  handleUpdatePost: (log: WorkoutLog) => void;
  handleSkipWorkout: (session: Session, program: Program, reason: 'skip' | 'gym_closed' | 'vacation' | 'sick' | 'other', notes?: string) => void;

  // Misc Actions
  handleSaveBodyLog: (log: BodyProgressLog) => void;
  handleSaveNutritionLog: (log: NutritionLog) => void;
  handleUpdateExerciseInProgram: (programId: string, sessionId: string, exerciseId: string, updatedExercise: Exercise) => void;
  handleUpdateProgressionWeights: (exerciseId: string, consolidated?: number, technical?: number) => void;
  handleUpdateExercise1RM: (exerciseDbId: string | undefined, exerciseName: string, new1RM: number | null, reps: number, testDate?: string, machineBrand?: string) => void;
  handleUpdateExerciseBrandPR: (exerciseDbId: string, brand: string, pr: { weight: number, reps: number, e1rm: number}) => void;

  handleStartRest: (duration: number, exerciseName: string) => void;
  handleAdjustRestTimer: (amountInSeconds: number) => void;
  handleSkipRestTimer: () => void;
  
  handleLogPress: () => void;
  
  addOrUpdateCustomExercise: (exercise: ExerciseMuscleInfo) => void;
  setExerciseList: React.Dispatch<React.SetStateAction<ExerciseMuscleInfo[]>>;
  exportExerciseDatabase: () => void;
  importExerciseDatabase: (jsonString: string) => void;

  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Feed Actions
  onCreatePostPress: () => void;
  onCustomizeFeedPress: () => void;

  // In-Workout Editor
  handleModifyWorkout: () => void;
  handleSaveModifiedWorkout: (session: Session) => void;
  setIsWorkoutEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Legacy/Future Use
  setYourLabAction: React.Dispatch<React.SetStateAction<any>>;
}