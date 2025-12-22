import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextState, AppContextDispatch, View, Program, Session, WorkoutLog, Settings, ExerciseMuscleInfo, OngoingWorkoutState } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import useGoogleDrive from '../hooks/useGoogleDrive';
import { INITIAL_MUSCLE_GROUP_DATA } from '../data/initialMuscleGroupDatabase';
import { INITIAL_MUSCLE_HIERARCHY } from '../data/initialMuscleHierarchy';
import { FOOD_DATABASE } from '../data/foodDatabase';

const AppStateContext = createContext<AppContextState | undefined>(undefined); 
const AppDispatchContext = createContext<AppContextDispatch | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { 
    const [view, setView] = useState<View>('home'); 
    const [historyStack, setHistoryStack] = useState<{ view: View; data?: any }[]>([{ view: 'home' }]); 
    const [settings, setSettings] = useLocalStorage<Settings>('yourprime-settings', { 
        weightUnit: 'kg', barbellWeight: 20, gymName: 'Mi Gimnasio', startWeekOn: 1, 
        soundsEnabled: true, remindersEnabled: false, reminderTime: '08:00', autoSyncEnabled: false, 
        hapticFeedbackEnabled: true, showPRsInWorkout: true, readinessCheckEnabled: false, 
        apiProvider: 'gemini', fallbackEnabled: false, workoutLoggerMode: 'pro', 
        enableGlassmorphism: true, enableAnimations: true, enableGlowEffects: true, enableZenMode: false, 
        userVitals: { gender: 'male' }, calorieGoalObjective: 'maintenance' 
    } as Settings); 
    const [programs, setPrograms] = useLocalStorage<Program[]>('programs', []); 
    const [history, setHistory] = useLocalStorage<WorkoutLog[]>('history', []); 
    const [exerciseList, setExerciseList] = useLocalStorage<ExerciseMuscleInfo[]>('exercise-db', []); 
    const [ongoingWorkout, setOngoingWorkout] = useLocalStorage<OngoingWorkoutState | null>('ongoing-workout', null);
    const [isDirty, setIsDirty] = useState(false);

    // Mocks para evitar errores de compilación
    const drive = useGoogleDrive({ settings, addToast: () => {}, onLoad: () => {} });
    const addToast = (msg: string) => console.log("Toast:", msg);
    const navigateTo = (newView: View, data?: any) => { setView(newView); setHistoryStack(prev => [...prev, {view: newView, data}]); };
    const handleBack = () => { if(historyStack.length > 1) { const newStack = historyStack.slice(0, -1); setHistoryStack(newStack); setView(newStack[newStack.length-1].view); }};
    
    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, [setSettings]);

    // State object 
    const state: AppContextState = { 
        view, historyStack, programs, history, settings, exerciseList, ongoingWorkout, 
        skippedLogs: [], bodyProgress: [], nutritionLogs: [], pantryItems: [], tasks: [], 
        exercisePlaylists: [], muscleGroupData: INITIAL_MUSCLE_GROUP_DATA, 
        muscleHierarchy: INITIAL_MUSCLE_HIERARCHY, foodDatabase: FOOD_DATABASE, 
        unlockedAchievements: [], isOnline: true, isAppLoading: false, installPromptEvent: null, 
        drive, toasts: [], bodyLabAnalysis: null, biomechanicalData: null, biomechanicalAnalysis: null, 
        syncQueue: [], aiNutritionPlan: null, activeProgramState: null, onExerciseCreated: null, 
        pendingQuestionnaires: [], postSessionFeedback: [], isBodyLogModalOpen: false, 
        isNutritionLogModalOpen: false, isMeasurementsModalOpen: false, isStartWorkoutModalOpen: false, 
        isCustomExerciseEditorOpen: false, isFoodEditorOpen: false, isFinishModalOpen: false, 
        isTimeSaverModalOpen: false, isTimersModalOpen: false, isReadinessModalOpen: false, 
        isAddToPlaylistSheetOpen: false, isWorkoutEditorOpen: false, isMuscleListEditorOpen: false, 
        isLiveCoachActive: false, isLogActionSheetOpen: false, isWorkoutExitModalOpen: false, 
        isAddPantryItemModalOpen: false, activeProgramId: null, editingProgramId: null, 
        editingSessionInfo: null, activeSession: null, loggingSessionInfo: null, viewingSessionInfo: null, 
        viewingExerciseId: null, viewingFoodId: null, viewingMuscleGroupId: null, viewingBodyPartId: null, 
        viewingChainId: null, viewingMuscleCategoryName: null, exerciseToAddId: null, 
        foodItemToAdd_to_pantry: null, editingCustomExerciseData: null, editingFoodData: null, 
        pendingWorkoutForReadinessCheck: null, editingWorkoutSessionInfo: null, editingCategoryInfo: null, 
        pendingNavigation: null, saveSessionTrigger: 0, addExerciseTrigger: 0, saveProgramTrigger: 0, 
        saveLoggedWorkoutTrigger: 0, modifyWorkoutTrigger: 0, searchQuery: '', activeSubTabs: {}, 
        restTimer: null, isDirty, yourLabAction: null, pendingCoachBriefing: null, 
        pendingWorkoutAfterBriefing: null, sleepLogs: [], sleepStartTime: null, isGlobalVoiceActive: false 
    };

    const dispatch: AppContextDispatch = {
        setPrograms, setHistory, setSettings: updateSettings, setOngoingWorkout, navigateTo, handleBack, addToast, setIsDirty,
        // Aquí irían el resto de funciones. Para que compile, usa 'as any' si faltan:
        ...({} as any) 
    };
    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
}; 

export const useAppState = () => useContext(AppStateContext)!; 
export const useAppDispatch = () => useContext(AppDispatchContext)!; 
export const useAppContext = () => ({ ...useAppState(), ...useAppDispatch() });