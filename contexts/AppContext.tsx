// contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AppContextState, AppContextDispatch, View, Program, Session, WorkoutLog, SkippedWorkoutLog,
  BodyProgressLog, NutritionLog, Settings, ExerciseMuscleInfo, OngoingWorkoutState,
  ToastData, CompletedExercise, Exercise, CustomExerciseModalData, ExercisePlaylist,
  MuscleGroupInfo, MuscleHierarchy, PlanDeviation, SessionBackground, ProgramWeek, Achievement,
  BodyLabAnalysis, BiomechanicalData, BiomechanicalAnalysis, Task, PantryItem
} from '../types';

import useSettings from '../hooks/useSettings';
import useLocalStorage from '../hooks/useLocalStorage';
import useAchievements from '../hooks/useAchievements';
import useGoogleDrive from '../hooks/useGoogleDrive';
import useExerciseDatabase from '../hooks/useExerciseDatabase';
import { INITIAL_MUSCLE_GROUP_DATA } from '../data/initialMuscleGroupDatabase';
import { INITIAL_MUSCLE_HIERARCHY } from '../data/initialMuscleHierarchy';
import { playSound } from '../services/soundService';
import { hapticImpact, hapticNotification, ImpactStyle, NotificationType } from '../services/hapticsService';
import { scheduleWorkoutReminders, cancelPendingNotifications } from '../services/notificationService';
import { generateBiomechanicalAnalysis } from '../services/aiService';

const AppStateContext = createContext<AppContextState | undefined>(undefined);
const AppDispatchContext = createContext<AppContextDispatch | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState<View>('home');
    const [historyStack, setHistoryStack] = useState<{ view: View; data?: any }[]>([{ view: 'home' }]);

    const [settings, setSettings, isSettingsLoading] = useSettings();
    const [programs, setPrograms, isProgramsLoading] = useLocalStorage<Program[]>('programs', []);
    const [history, setHistory, isHistoryLoading] = useLocalStorage<WorkoutLog[]>('history', []);
    const [skippedLogs, setSkippedLogs, isSkippedLoading] = useLocalStorage<SkippedWorkoutLog[]>('skipped-logs', []);
    const [bodyProgress, setBodyProgress, isBodyProgressLoading] = useLocalStorage<BodyProgressLog[]>('body-progress', []);
    const [nutritionLogs, setNutritionLogs, isNutritionLogsLoading] = useLocalStorage<NutritionLog[]>('nutrition-logs', []);
    const [pantryItems, setPantryItems, isPantryLoading] = useLocalStorage<PantryItem[]>('yourprime-pantry-items', []);
    const [tasks, setTasks] = useLocalStorage<Task[]>('yourprime-tasks', []);
    const [ongoingWorkout, setOngoingWorkout] = useLocalStorage<OngoingWorkoutState | null>('ongoing-workout-session', null);
    const [exercisePlaylists, setExercisePlaylists] = useLocalStorage<ExercisePlaylist[]>('yourprime-playlists', []);
    const [muscleGroupData, setMuscleGroupData] = useLocalStorage<MuscleGroupInfo[]>('yourprime-muscle-group-data', INITIAL_MUSCLE_GROUP_DATA);
    const [muscleHierarchy, setMuscleHierarchy] = useLocalStorage<MuscleHierarchy>('yourprime-muscle-hierarchy', INITIAL_MUSCLE_HIERARCHY);
    const [bodyLabAnalysis, _setBodyLabAnalysis] = useLocalStorage<BodyLabAnalysis | null>('yourprime-bodylab-analysis', null);
    const [biomechanicalData, _setBiomechanicalData] = useLocalStorage<BiomechanicalData | null>('yourprime-biomechanical-data', null);
    const [biomechanicalAnalysis, _setBiomechanicalAnalysis] = useLocalStorage<BiomechanicalAnalysis | null>('yourprime-biomechanical-analysis', null);
    const [syncQueue, setSyncQueue] = useLocalStorage<WorkoutLog[]>('yourprime-sync-queue', []);

    const { unlockedAchievements, checkAndUnlock } = useAchievements();
    const { exerciseList, setExerciseList, isDbLoading, addOrUpdateCustomExercise, exportExerciseDatabase, importExerciseDatabase } = useExerciseDatabase();
    
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [scrollPositions, setScrollPositions] = useLocalStorage<{ [key: string]: number }>('yourprime-scroll-positions', {});
    
    // --- MODAL & SHEET STATES ---
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [isTimeSaverModalOpen, setIsTimeSaverModalOpen] = useState(false);
    const [isTimersModalOpen, setIsTimersModalOpen] = useState(false);
    const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
    const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] = useState(false);
    const [isCustomExerciseEditorOpen, setIsCustomExerciseEditorOpen] = useState(false);
    const [isWorkoutEditorOpen, setIsWorkoutEditorOpen] = useState(false);
    const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState(false);
    
    // --- EDITING & VIEWING STATES (ID-BASED) ---
    const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
    const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
    const [editingSessionInfo, setEditingSessionInfo] = useState<{ programId: string; macroIndex: number; mesoIndex: number; weekId: string; sessionId?: string; } | null>(null);
    const [loggingSessionInfo, setLoggingSessionInfo] = useState<{ programId: string; sessionId: string } | null>(null);
    const [activeSession, setActiveSession] = useState<Session | null>(null); // For live workout only
    const [viewingExerciseId, setViewingExerciseId] = useState<string | null>(null);
    const [viewingMuscleGroupId, setViewingMuscleGroupId] = useState<string | null>(null);
    const [viewingBodyPartId, setViewingBodyPartId] = useState<string | null>(null);
    const [viewingChainId, setViewingChainId] = useState<string | null>(null);
    const [viewingMuscleCategoryName, setViewingMuscleCategoryName] = useState<string | null>(null);
    const [exerciseToAddId, setExerciseToAddId] = useState<string | null>(null);
    const [editingCustomExerciseData, setEditingCustomExerciseData] = useState<CustomExerciseModalData | null>(null);
    const [pendingWorkoutForReadinessCheck, setPendingWorkoutForReadinessCheck] = useState<{ session: Session; program: Program; weekVariant?: 'A' | 'B' | 'C' | 'D' } | null>(null);
    const [editingWorkoutSessionInfo, setEditingWorkoutSessionInfo] = useState<{ session: Session; programId: string; macroIndex: number; mesoIndex: number; weekId: string; } | null>(null);

    // --- TRIGGERS ---
    const [saveSessionTrigger, setSaveSessionTrigger] = useState(0);
    const [addExerciseTrigger, setAddExerciseTrigger] = useState(0);
    const [saveProgramTrigger, setSaveProgramTrigger] = useState(0);
    const [saveLoggedWorkoutTrigger, setSaveLoggedWorkoutTrigger] = useState(0);
    const [modifyWorkoutTrigger, setModifyWorkoutTrigger] = useState(0);

    const [currentBackgroundOverride, setCurrentBackgroundOverride] = useState<SessionBackground | undefined>();
    const [restTimer, setRestTimer] = useState<{ duration: number; remaining: number; key: number; exerciseName: string; endTime: number; } | null>(null);
    const restTimerInterval = useRef<number | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const isAppLoading = isSettingsLoading || isProgramsLoading || isHistoryLoading || isSkippedLoading || isBodyProgressLoading || isNutritionLogsLoading || isDbLoading || isPantryLoading;

    // --- TOASTS ---
    const addToast = useCallback((message: string, type: ToastData['type'] = 'success', title?: string, duration?: number) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, title, duration }]);
    }, []);
    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- TASKS ---
    const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            completed: false,
            ...task
        };
        setTasks(prev => [newTask, ...prev]);
    }, [setTasks]);

    const toggleTask = useCallback((taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    }, [setTasks]);

    const deleteTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    }, [setTasks]);

    // --- GOOGLE DRIVE ---
    const drive = useGoogleDrive({
        settings, addToast,
        onLoad: (data: any) => {
            if (data.programs) setPrograms(data.programs);
            if (data.history) setHistory(data.history);
            if (data.settings) setSettings(data.settings);
            if (data['body-progress']) setBodyProgress(data['body-progress']);
            if (data['nutrition-logs']) setNutritionLogs(data['nutrition-logs']);
            if (data['skipped-logs']) setSkippedLogs(data['skipped-logs']);
            addToast('Datos cargados desde Google Drive.', 'success');
        }
    });

    const setScrollPosition = useCallback((key: string, position: number) => {
        setScrollPositions(prev => ({ ...prev, [key]: position }));
    }, [setScrollPositions]);

    // --- NAVIGATION ---
    const navigateTo = useCallback((newView: View, data?: any, options?: { replace?: boolean }) => {
        const stateToPush = { view: newView, data };
        if (options?.replace) {
            setHistoryStack(prev => [...prev.slice(0, -1), stateToPush]);
        } else {
            setHistoryStack(prev => [...prev, stateToPush]);
        }
        
        // This logic sets the state for the *new* view that is about to be rendered.
        setActiveProgramId(null); setEditingProgramId(null); setEditingSessionInfo(null);
        setLoggingSessionInfo(null); setViewingExerciseId(null); setViewingMuscleGroupId(null);
        setViewingBodyPartId(null); setViewingChainId(null); setViewingMuscleCategoryName(null);

        if (data) {
            switch(newView) {
                case 'program-detail': setActiveProgramId(data.programId); break;
                case 'program-editor': setEditingProgramId(data.programId || null); break;
                case 'session-editor': setEditingSessionInfo(data); break;
                case 'log-workout': setLoggingSessionInfo(data); break;
                case 'exercise-detail': setViewingExerciseId(data.exerciseId); break;
                case 'muscle-group-detail': setViewingMuscleGroupId(data.muscleGroupId); break;
                case 'body-part-detail': setViewingBodyPartId(data.bodyPartId); break;
                case 'chain-detail': setViewingChainId(data.chainId); break;
                case 'muscle-category': setViewingMuscleCategoryName(data.categoryName); break;
            }
        }
        setView(newView);
    }, []);
    
    const handleBack = useCallback(() => {
        if (historyStack.length <= 1) return;

        const newStack = historyStack.slice(0, -1);
        const previousState = newStack[newStack.length - 1];
        setHistoryStack(newStack);

        // Clear all contextual states to prevent stale data
        setActiveProgramId(null); setEditingProgramId(null); setEditingSessionInfo(null);
        setLoggingSessionInfo(null); setViewingExerciseId(null); setViewingMuscleGroupId(null);
        setViewingBodyPartId(null); setViewingChainId(null); setViewingMuscleCategoryName(null);

        // Restore the specific context for the view we are returning to
        if (previousState.data) {
            switch(previousState.view) {
                case 'program-detail': setActiveProgramId(previousState.data.programId); break;
                case 'program-editor': setEditingProgramId(previousState.data.programId || null); break;
                case 'session-editor': setEditingSessionInfo(previousState.data); break;
                case 'log-workout': setLoggingSessionInfo(previousState.data); break;
                case 'exercise-detail': setViewingExerciseId(previousState.data.exerciseId); break;
                case 'muscle-group-detail': setViewingMuscleGroupId(previousState.data.muscleGroupId); break;
                case 'body-part-detail': setViewingBodyPartId(previousState.data.bodyPartId); break;
                case 'chain-detail': setViewingChainId(previousState.data.chainId); break;
                case 'muscle-category': setViewingMuscleCategoryName(previousState.data.categoryName); break;
            }
        }
        
        // Set the view to trigger re-render
        setView(previousState.view);
    }, [historyStack]);
    
    // --- CRUD: Programs ---
    const handleCreateProgram = () => navigateTo('program-editor');
    const handleEditProgram = (programId: string) => navigateTo('program-editor', { programId });
    const handleSaveProgram = (program: Program) => {
        const newlyCreated = !programs.some(p => p.id === program.id);
        setPrograms(prev => {
            const index = prev.findIndex(p => p.id === program.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = program;
                return updated;
            }
            return [...prev, program];
        });
        if (newlyCreated) {
            const unlocked: Achievement[] = checkAndUnlock({ programJustCreated: true });
            if (unlocked.length > 0) addToast(unlocked[0].name, 'achievement', '¡Logro Desbloqueado!');
        }
        navigateTo('program-detail', { programId: program.id }, { replace: true });
        addToast("Programa guardado.", "success");
    };
    const handleDeleteProgram = (programId: string) => {
        if(window.confirm('¿Seguro que quieres eliminar este programa? Se perderán todos los datos asociados.')) {
            setPrograms(prev => prev.filter(p => p.id !== programId));
            setHistory(prev => prev.filter(h => h.programId !== programId));
            navigateTo('home', undefined, { replace: true });
        }
    };

    // --- CRUD: Sessions ---
    const handleAddSession = (programId: string, macroIndex: number, mesoIndex: number, weekId: string) => {
        navigateTo('session-editor', { programId, macroIndex, mesoIndex, weekId }); // No sessionId for new session
    };
    const handleEditSession = (programId: string, macroIndex: number, mesoIndex: number, weekId: string, sessionId: string) => {
        navigateTo('session-editor', { programId, macroIndex, mesoIndex, weekId, sessionId });
    };

    const handleUpdateSessionInProgram = useCallback((session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => {
        setPrograms(prevPrograms => {
            const newPrograms = JSON.parse(JSON.stringify(prevPrograms));
            const program = newPrograms.find((p: Program) => p.id === programId);
            if (!program) return prevPrograms;

            const week = program.macrocycles[macroIndex]?.mesocycles[mesoIndex]?.weeks.find((w: ProgramWeek) => w.id === weekId);
            if (week) {
                const sessionIndex = week.sessions.findIndex((s: Session) => s.id === session.id);
                if (sessionIndex > -1) {
                    week.sessions[sessionIndex] = session; // Update existing
                } else {
                    week.sessions.push(session); // Add new
                }
            } else {
                console.error("Critical error: Week not found during session update.", { programId, macroIndex, mesoIndex, weekId });
            }
            return newPrograms;
        });
    }, [setPrograms]);
    
    const handleSaveSession = useCallback((session: Session, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => {
        const sessionToSave = JSON.parse(JSON.stringify(session));
        let newExercisesAdded = false;

        sessionToSave.exercises.forEach((ex: Exercise) => {
            if (!ex.exerciseDbId && ex.name) {
                let dbEx = exerciseList.find(db => db.name.toLowerCase() === ex.name.toLowerCase());
                if (!dbEx) {
                    console.log(`Creating new custom exercise from Session Editor: ${ex.name}`);
                    const newCustomExercise: ExerciseMuscleInfo = {
                        id: `custom_${crypto.randomUUID()}`, name: ex.name, description: 'Añade una descripción...',
                        involvedMuscles: [], category: 'Hipertrofia', type: 'Accesorio',
                        equipment: 'Otro', force: 'Otro', isCustom: true
                    };
                    addOrUpdateCustomExercise(newCustomExercise);
                    ex.exerciseDbId = newCustomExercise.id;
                    newExercisesAdded = true;
                } else {
                    ex.exerciseDbId = dbEx.id;
                }
            }
        });
        
        handleUpdateSessionInProgram(sessionToSave, programId, macroIndex, mesoIndex, weekId);
        handleBack();
        
        if (newExercisesAdded) {
            addToast("Nuevos ejercicios creados y añadidos a YourLab.", "suggestion");
        }

    }, [handleUpdateSessionInProgram, handleBack, exerciseList, addOrUpdateCustomExercise, addToast]);

    const handleDeleteSession = (sessionId: string, programId: string, macroIndex: number, mesoIndex: number, weekId: string) => {
         if(window.confirm('¿Seguro que quieres eliminar esta sesión?')) {
            setPrograms(prevPrograms => {
                const newPrograms = JSON.parse(JSON.stringify(prevPrograms));
                const program = newPrograms.find((p: Program) => p.id === programId);
                if (!program) return prevPrograms;
                const week = program.macrocycles[macroIndex]?.mesocycles[mesoIndex]?.weeks.find((w: ProgramWeek) => w.id === weekId);
                if (week) {
                    week.sessions = week.sessions.filter((s: Session) => s.id !== sessionId);
                }
                return newPrograms;
            });
        }
    };
    
    // --- WORKOUT LOGIC ---
    const onCancelWorkout = useCallback(() => {
        if (window.confirm('¿Estás seguro de que quieres cancelar el entrenamiento? No se guardará el progreso.')) {
            setOngoingWorkout(null);
            setActiveSession(null);
            setView('home');
            setHistoryStack([{ view: 'home' }]);
            if (settings.hapticFeedbackEnabled) hapticNotification(NotificationType.Warning);
        }
    }, [setOngoingWorkout, settings.hapticFeedbackEnabled]);

    const handleStartWorkout = useCallback((session: Session, program: Program, weekVariant?: 'A' | 'B' | 'C' | 'D') => {
        const start = (readiness?: OngoingWorkoutState['readiness']) => {
            const activeMode = weekVariant || 'A';
            const exercisesForMode = activeMode === 'A' || !(session as any)[`session${activeMode}`] 
                ? session.exercises 
                : (session as any)[`session${activeMode}`].exercises;
            const newState: OngoingWorkoutState = {
                programId: program.id, session, startTime: Date.now(),
                activeExerciseId: exercisesForMode[0]?.id || null,
                activeSetId: exercisesForMode[0]?.sets[0]?.id || null,
                activeMode: activeMode, completedSets: {}, dynamicWeights: {}, exerciseFeedback: {},
                unilateralImbalances: {}, readiness
            };
            setOngoingWorkout(newState);
            setActiveSession(session);
            navigateTo('workout');
            if (settings.hapticFeedbackEnabled) hapticImpact(ImpactStyle.Heavy);
        };

        if (settings.readinessCheckEnabled && !ongoingWorkout) {
            setPendingWorkoutForReadinessCheck({ session, program, weekVariant });
            setIsReadinessModalOpen(true);
        } else {
            start(ongoingWorkout?.readiness);
        }
    }, [navigateTo, setOngoingWorkout, settings, ongoingWorkout]);

    const handleContinueFromReadiness = (data: any) => {
        if (pendingWorkoutForReadinessCheck) {
            const { session, program, weekVariant } = pendingWorkoutForReadinessCheck;
            const readinessScore = Math.round(((data.sleepQuality + (6 - data.stressLevel) + (6 - data.doms) + data.motivation) / 20) * 100);
            const readinessData = { ...data, readinessScore };
            
            const start = () => {
                const activeMode = weekVariant || 'A';
                const exercisesForMode = activeMode === 'A' || !(session as any)[`session${activeMode}`] 
                    ? session.exercises 
                    : (session as any)[`session${activeMode}`].exercises;
                const newState: OngoingWorkoutState = {
                    programId: program.id, session, startTime: Date.now(),
                    activeExerciseId: exercisesForMode[0]?.id || null,
                    activeSetId: exercisesForMode[0]?.sets[0]?.id || null,
                    activeMode: activeMode, completedSets: {}, dynamicWeights: {}, exerciseFeedback: {},
                    unilateralImbalances: {}, readiness: readinessData
                };
                setOngoingWorkout(newState);
                setActiveSession(session);
                navigateTo('workout');
                if (settings.hapticFeedbackEnabled) hapticImpact(ImpactStyle.Heavy);
            };
            start();
        }
        setIsReadinessModalOpen(false);
        setPendingWorkoutForReadinessCheck(null);
    };

    const handleFinishWorkout = useCallback((completedExercises: CompletedExercise[], duration: number, notes?: string, discomforts?: string[], fatigue?: number, clarity?: number, logDate?: string, photo?: string, planDeviations?: PlanDeviation[]) => {
        if (!ongoingWorkout) return;
        const newLog: WorkoutLog = {
            id: crypto.randomUUID(), programId: ongoingWorkout.programId,
            programName: programs.find(p => p.id === ongoingWorkout.programId)?.name || 'Unknown',
            sessionId: ongoingWorkout.session.id, sessionName: ongoingWorkout.session.name,
            date: logDate ? new Date(logDate).toISOString() : new Date().toISOString(),
            duration, completedExercises, notes, discomforts,
            fatigueLevel: fatigue || 5, mentalClarity: clarity || 5,
            gymName: settings.gymName,
            photo: photo,
            planDeviations: planDeviations,
            readiness: ongoingWorkout.readiness,
        };

        const saveLog = (log: WorkoutLog) => {
            const newHistory = [...history, log];
            setHistory(newHistory);
            try {
                const unlocked = checkAndUnlock({ log: newLog, history: newHistory });
                if (unlocked.length > 0) {
                    unlocked.forEach(ach => addToast(ach.name, 'achievement', '¡Logro Desbloqueado!'));
                }
            } catch (e) {
                console.error("Error checking achievements, but log was saved:", e);
            }
        };

        if (!isOnline) {
            setSyncQueue(prev => [...prev, newLog]);
            addToast('Estás sin conexión. El entrenamiento se guardará en la cola de sincronización.', 'suggestion');
        } else {
            saveLog(newLog);
        }

        setOngoingWorkout(null);
        setActiveSession(null);
        setIsFinishModalOpen(false);
        navigateTo('home', undefined, { replace: true });
        playSound('session-complete-sound');
        if (settings.hapticFeedbackEnabled) hapticNotification(NotificationType.Success);
    }, [ongoingWorkout, programs, settings.gymName, history, setHistory, checkAndUnlock, setOngoingWorkout, setIsFinishModalOpen, navigateTo, settings.hapticFeedbackEnabled, addToast, isOnline, setSyncQueue]);
    
     const handleSaveLoggedWorkout = useCallback((log: WorkoutLog) => {
        const newHistory = [...history, log];
        setHistory(newHistory);
        try {
            const unlocked = checkAndUnlock({ log, history: newHistory });
            if (unlocked.length > 0) {
                unlocked.forEach(ach => addToast(ach.name, 'achievement', '¡Logro Desbloqueado!'));
            }
        } catch (e) {
            console.error("Error checking achievements, but log was saved:", e);
        }
        handleBack();
        addToast("Entrenamiento registrado con éxito.", "success");
        if (settings.hapticFeedbackEnabled) hapticNotification(NotificationType.Success);
    }, [history, setHistory, checkAndUnlock, handleBack, addToast, settings.hapticFeedbackEnabled]);

    const handleUpdatePost = useCallback((updatedLog: WorkoutLog) => {
        setHistory(prev => prev.map(log => log.id === updatedLog.id ? updatedLog : log));
        addToast("Publicación actualizada", "success");
    }, [setHistory, addToast]);
    
    // --- Other handlers ---
    const handleUpdateExercise1RM = useCallback((exerciseDbId: string | undefined, exerciseName: string, new1RM: number | null, reps: number, testDate?: string, machineBrand?: string) => {
        const key = exerciseDbId || exerciseName.toLowerCase();
        setExerciseList(prev => prev.map(ex => {
            const exKey = ex.id || ex.name.toLowerCase();
            if (exKey === key) {
                return { ...ex, calculated1RM: new1RM || undefined };
            }
            return ex;
        }));
    }, [setExerciseList]);
    
    const openCustomExerciseEditor = useCallback((data?: CustomExerciseModalData) => {
        setEditingCustomExerciseData(data || null);
        setIsCustomExerciseEditorOpen(true);
    }, []);

    const closeCustomExerciseEditor = useCallback(() => {
        setIsCustomExerciseEditorOpen(false);
        setEditingCustomExerciseData(null);
    }, []);

    const handleStartRest = useCallback((duration: number, exerciseName: string) => {
        if (restTimerInterval.current) clearInterval(restTimerInterval.current);
        
        const key = Date.now();
        const endTime = Date.now() + duration * 1000;
        
        setRestTimer({ duration, remaining: duration, key, exerciseName, endTime });
        
        restTimerInterval.current = window.setInterval(() => {
            setRestTimer(currentTimer => {
                if (currentTimer && currentTimer.key === key) {
                    const newRemaining = Math.max(0, Math.round((currentTimer.endTime - Date.now()) / 1000));
                    
                    if (newRemaining <= 0) {
                        clearInterval(restTimerInterval.current!);
                        if (currentTimer.remaining > 0) { // Fire only once
                            playSound('rest-timer-sound');
                            if (settings.hapticFeedbackEnabled) {
                                hapticNotification(NotificationType.SUCCESS);
                                setTimeout(() => hapticImpact(ImpactStyle.Medium), 150);
                            }
                            
                            // Visual Flash
                            const flash = document.createElement('div');
                            flash.style.position = 'fixed';
                            flash.style.inset = '0';
                            flash.style.width = '100vw';
                            flash.style.height = '100vh';
                            flash.style.backgroundColor = 'white';
                            flash.style.zIndex = '99999';
                            flash.style.opacity = '0.3';
                            flash.style.pointerEvents = 'none';
                            flash.style.transition = 'opacity 0.5s ease-out';
                            document.body.appendChild(flash);
                            setTimeout(() => {
                                flash.style.opacity = '0';
                                setTimeout(() => document.body.removeChild(flash), 500);
                            }, 100);
                        }
                        setTimeout(() => setRestTimer(t => t?.key === key ? null : t), 3000); // Clear after "Done!" message time
                        return { ...currentTimer, remaining: 0 };
                    }
                    return { ...currentTimer, remaining: newRemaining };
                }
                // If timer has been cleared elsewhere, stop this interval.
                if (!currentTimer) {
                    clearInterval(restTimerInterval.current!);
                }
                return currentTimer;
            });
        }, 250); // Run more frequently for smoother updates and faster response on resume
    }, [settings.hapticFeedbackEnabled]);

    const handleAdjustRestTimer = useCallback((amountInSeconds: number) => {
        setRestTimer(currentTimer => {
            if (!currentTimer) return null;
            const newEndTime = currentTimer.endTime + (amountInSeconds * 1000);
            const newRemaining = Math.max(0, currentTimer.remaining + amountInSeconds);
            return { ...currentTimer, remaining: newRemaining, endTime: newEndTime };
        });
    }, []);
    
    const handleSkipRestTimer = useCallback(() => {
        if (restTimerInterval.current) clearInterval(restTimerInterval.current);
        setRestTimer(null);
    }, []);

    const handleModifyWorkout = useCallback(() => {
        if (!ongoingWorkout) return;
        const program = programs.find(p => p.id === ongoingWorkout.programId);
        if (!program) return;
        let sessionInfo;
        program.macrocycles.forEach((macro, macroIndex) => {
            if(sessionInfo) return;
            macro.mesocycles.forEach((meso, mesoIndex) => {
                if(sessionInfo) return;
                meso.weeks.forEach(week => {
                    if(sessionInfo) return;
                    if(week.sessions.some(s => s.id === ongoingWorkout.session.id)) {
                        sessionInfo = { session: ongoingWorkout.session, programId: program.id, macroIndex, mesoIndex, weekId: week.id };
                    }
                });
            });
        });
        if (sessionInfo) {
            setEditingWorkoutSessionInfo(sessionInfo);
            setIsWorkoutEditorOpen(true);
        } else {
            addToast("No se pudo encontrar la sesión original para modificar.", "danger");
        }
    }, [ongoingWorkout, programs, addToast]);
    
    const handleSaveModifiedWorkout = useCallback((session: Session) => {
        setOngoingWorkout(prev => prev ? ({ ...prev, session }) : null);
        setIsWorkoutEditorOpen(false);
        setEditingWorkoutSessionInfo(null);
        addToast("Sesión en curso modificada.", "success");
    }, [setOngoingWorkout, addToast]);

    const setBodyLabAnalysis = useCallback((analysis: BodyLabAnalysis | null) => {
        _setBodyLabAnalysis(analysis);
    }, [_setBodyLabAnalysis]);

    const setBiomechanicalData = useCallback(async (data: BiomechanicalData) => {
        _setBiomechanicalData(data);
        if (!isOnline) {
            addToast("El análisis biomecánico requiere conexión a internet.", "danger");
            return;
        }
        addToast("Generando análisis biomecánico...", "suggestion");
        try {
            const keyExercises = ['Sentadilla', 'Press de Banca', 'Peso Muerto', 'Press Militar'];
            const analysis = await generateBiomechanicalAnalysis(data, keyExercises, settings);
            _setBiomechanicalAnalysis(analysis);
            addToast("¡Análisis biomecánico completado!", "success");
        } catch (error: any) {
            console.error("Failed to generate biomechanical analysis:", error);
            addToast(`Error al generar análisis: ${error.message}`, "danger");
            throw error;
        }
    }, [_setBiomechanicalData, _setBiomechanicalAnalysis, isOnline, settings, addToast]);

    // --- OFFLINE SYNC LOGIC ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const processSyncQueue = async () => {
            if (syncQueue.length === 0) return;
            
            addToast(`Sincronizando ${syncQueue.length} entrenamiento(s) pendiente(s)...`, 'suggestion');
            
            // Add queued items to history
            setHistory(prevHistory => [...prevHistory, ...syncQueue]);
            
            // Clear the queue
            setSyncQueue([]);
            
            // Trigger Google Drive sync if enabled
            if (settings.autoSyncEnabled && drive.isSignedIn) {
                // We need a slight delay to ensure the history state has updated before syncing
                setTimeout(() => {
                    drive.syncToDrive();
                    addToast('Sincronización completada.', 'success');
                }, 1000);
            } else {
                 addToast('Sincronización local completada.', 'success');
            }
        };

        if (isOnline && syncQueue.length > 0) {
            processSyncQueue();
        }
    }, [isOnline, syncQueue, setSyncQueue, setHistory, settings.autoSyncEnabled, drive, addToast]);


    const stateValue: AppContextState = useMemo(() => ({
        view, historyStack, programs, history, skippedLogs, settings, bodyProgress, nutritionLogs, pantryItems, tasks,
        exercisePlaylists, muscleGroupData, muscleHierarchy, exerciseList, unlockedAchievements,
        isOnline, isAppLoading, installPromptEvent, drive, toasts, activeProgramId, editingProgramId,
        editingSessionInfo, activeSession, loggingSessionInfo, viewingExerciseId, viewingMuscleGroupId,
        viewingBodyPartId, viewingChainId, viewingMuscleCategoryName, exerciseToAddId, ongoingWorkout,
        isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, isReadinessModalOpen, isAddToPlaylistSheetOpen,
        isCustomExerciseEditorOpen, editingCustomExerciseData, pendingWorkoutForReadinessCheck,
        isWorkoutEditorOpen, editingWorkoutSessionInfo, saveSessionTrigger, addExerciseTrigger, saveProgramTrigger,
        saveLoggedWorkoutTrigger, modifyWorkoutTrigger, yourLabAction: null, currentBackgroundOverride,
        restTimer, isDirty, scrollPositions: {}, bodyLabAnalysis, biomechanicalData, isMeasurementsModalOpen, syncQueue,
        isMuscleListEditorOpen: false, // Placeholder
        editingCategoryInfo: null, // Placeholder
        biomechanicalAnalysis,
        isStartWorkoutModalOpen: false,
    }), [
        view, historyStack, programs, history, skippedLogs, settings, bodyProgress, nutritionLogs, pantryItems, tasks, exercisePlaylists,
        muscleGroupData, muscleHierarchy, exerciseList, unlockedAchievements, isOnline, isAppLoading, installPromptEvent,
        drive, toasts, activeProgramId, editingProgramId, editingSessionInfo, activeSession, loggingSessionInfo,
        viewingExerciseId, viewingMuscleGroupId, viewingBodyPartId, viewingChainId, viewingMuscleCategoryName,
        exerciseToAddId, ongoingWorkout, isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, isReadinessModalOpen,
        isAddToPlaylistSheetOpen, isCustomExerciseEditorOpen, editingCustomExerciseData, pendingWorkoutForReadinessCheck,
        isWorkoutEditorOpen, editingWorkoutSessionInfo, saveSessionTrigger, addExerciseTrigger, saveProgramTrigger,
        saveLoggedWorkoutTrigger, modifyWorkoutTrigger, currentBackgroundOverride, restTimer, isDirty, 
        bodyLabAnalysis, biomechanicalData, biomechanicalAnalysis, isMeasurementsModalOpen, syncQueue
    ]);

    const dispatchValue: AppContextDispatch = useMemo(() => ({
        setPrograms, setHistory, setSkippedLogs, setSettings, setBodyProgress, setNutritionLogs, setPantryItems, setTasks, addTask, toggleTask, deleteTask,
        setExercisePlaylists, addOrUpdatePlaylist: (playlist) => setExercisePlaylists(prev => {
            const index = prev.findIndex(p => p.id === playlist.id);
            if (index > -1) { const updated = [...prev]; updated[index] = playlist; return updated; }
            return [...prev, playlist];
        }), deletePlaylist: (playlistId) => setExercisePlaylists(prev => prev.filter(p => p.id !== playlistId)), 
        setMuscleGroupData, updateMuscleGroupInfo: (id, data) => setMuscleGroupData(prev => prev.map(m => m.id === id ? {...m, ...data} : m)), 
        setMuscleHierarchy, renameMuscleCategory: (oldName, newName) => setMuscleHierarchy(prev => {
            const newHierarchy = JSON.parse(JSON.stringify(prev));
            newHierarchy.bodyPartHierarchy[newName] = newHierarchy.bodyPartHierarchy[oldName];
            delete newHierarchy.bodyPartHierarchy[oldName];
            // Also update muscleToBodyPart
            Object.keys(newHierarchy.muscleToBodyPart).forEach(key => {
                if (newHierarchy.muscleToBodyPart[key] === oldName) {
                    newHierarchy.muscleToBodyPart[key] = newName;
                }
            });
            return newHierarchy;
        }),
        renameMuscleGroup: (categoryName, oldName, newName) => setMuscleHierarchy(prev => {
            const newHierarchy = JSON.parse(JSON.stringify(prev));
            const category = newHierarchy.bodyPartHierarchy[categoryName];
            if(category) {
                const index = category.indexOf(oldName);
                if (index > -1) category[index] = newName;
            }
            if(newHierarchy.muscleToBodyPart[oldName]) {
                delete newHierarchy.muscleToBodyPart[oldName];
                newHierarchy.muscleToBodyPart[newName] = categoryName;
            }
            return newHierarchy;
        }),
        setBodyLabAnalysis,
        setBiomechanicalData,
        setBiomechanicalAnalysis: _setBiomechanicalAnalysis,
        setInstallPromptEvent, setIsFinishModalOpen, setIsTimeSaverModalOpen, setIsTimersModalOpen,
        setIsReadinessModalOpen, setIsAddToPlaylistSheetOpen, setIsMeasurementsModalOpen, openCustomExerciseEditor, closeCustomExerciseEditor, 
        setExerciseToAddId, setSaveSessionTrigger, setAddExerciseTrigger, setSaveProgramTrigger,
        setSaveLoggedWorkoutTrigger, setModifyWorkoutTrigger, setYourLabAction: () => {}, 
        setCurrentBackgroundOverride, setOngoingWorkout, navigateTo, handleBack, addToast, removeToast,
        handleCreateProgram, handleEditProgram, handleSelectProgram: (p) => navigateTo('program-detail', { programId: p.id }),
        handleSaveProgram, handleUpdateProgram: handleSaveProgram, handleDeleteProgram,
        handleAddSession, handleEditSession, handleSaveSession, handleUpdateSessionInProgram, handleDeleteSession,
        handleStartWorkout, handleResumeWorkout: () => navigateTo('workout'), handleContinueFromReadiness,
        onCancelWorkout, handlePauseWorkout: () => navigateTo('home'), handleFinishWorkout,
        handleLogWorkout: (programId, sessionId) => navigateTo('log-workout', { programId, sessionId }),
        handleSaveLoggedWorkout, handleUpdatePost, 
        handleSkipWorkout: (session, program, reason, notes) => setSkippedLogs(prev => [...prev, { id: crypto.randomUUID(), date: new Date().toISOString(), programId: program.id, sessionId: session.id, sessionName: session.name, programName: program.name, reason, notes }]),
        handleSaveBodyLog: (log) => {
            setBodyProgress(prev => [...prev, log]);
            addToast("Registro corporal guardado.", "success");
            const unlocked = checkAndUnlock({ log: undefined }); // Check for achievements like adding first photo
            if (unlocked.length > 0) addToast(unlocked[0].name, 'achievement', '¡Logro Desbloqueado!');
            
        }, 
        handleSaveNutritionLog: (log) => {
            setNutritionLogs(prev => [...prev, log]);
            addToast("Registro de comida guardado.", "success");
        }, 
        handleUpdateExerciseInProgram: (programId, sessionId, exerciseId, updatedExercise) => {
            setPrograms(prev => {
                const newPrograms = JSON.parse(JSON.stringify(prev));
                // This is a deep update, it needs to find the exact exercise
                for (const prog of newPrograms) {
                    if (prog.id === programId) {
                        for (const macro of prog.macrocycles) {
                            for (const meso of macro.mesocycles) {
                                for (const week of meso.weeks) {
                                    for (const session of week.sessions) {
                                        if (session.id === sessionId) {
                                            const exIndex = session.exercises.findIndex((ex: Exercise) => ex.id === exerciseId);
                                            if (exIndex > -1) {
                                                session.exercises[exIndex] = updatedExercise;
                                                return newPrograms;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return prev; // Return old state if not found
            });
        },
        handleUpdateProgressionWeights: () => {},
        handleUpdateExercise1RM, 
        handleUpdateExerciseBrandPR: () => {},
        handleStartRest, handleAdjustRestTimer, handleSkipRestTimer,
        handleLogPress: () => navigateTo('log-hub'), addOrUpdateCustomExercise, setExerciseList,
        exportExerciseDatabase, importExerciseDatabase, setIsDirty, 
        onCreatePostPress: () => {}, onCustomizeFeedPress: () => {}, handleModifyWorkout, handleSaveModifiedWorkout, setIsWorkoutEditorOpen,
        // Placeholders for new functions
        openMuscleListEditor: () => {}, closeMuscleListEditor: () => {}, updateCategoryMuscles: () => {},
        setIsStartWorkoutModalOpen: () => {},
    }), [
        setPrograms, setHistory, setSkippedLogs, setSettings, setBodyProgress, setNutritionLogs, setPantryItems, setTasks, addTask, toggleTask, deleteTask, setExercisePlaylists,
        setMuscleGroupData, setMuscleHierarchy, setBodyLabAnalysis, setBiomechanicalData, _setBiomechanicalAnalysis, setInstallPromptEvent, setIsFinishModalOpen, setIsTimeSaverModalOpen,
        setIsTimersModalOpen, setIsReadinessModalOpen, setIsAddToPlaylistSheetOpen, setIsMeasurementsModalOpen, openCustomExerciseEditor,
        closeCustomExerciseEditor, setExerciseToAddId, setSaveSessionTrigger, setAddExerciseTrigger,
        setSaveProgramTrigger, setSaveLoggedWorkoutTrigger, setModifyWorkoutTrigger, setCurrentBackgroundOverride,
        setOngoingWorkout, navigateTo, handleBack, addToast, removeToast, handleSaveProgram, handleEditProgram,
        handleDeleteProgram, handleAddSession, handleEditSession, handleSaveSession, handleUpdateSessionInProgram,
        handleDeleteSession, handleStartWorkout, handleContinueFromReadiness, onCancelWorkout, handleFinishWorkout,
        handleSaveLoggedWorkout, handleUpdatePost, handleUpdateExercise1RM, handleStartRest, handleAdjustRestTimer,
        handleSkipRestTimer, addOrUpdateCustomExercise, setExerciseList, exportExerciseDatabase, importExerciseDatabase,
        setIsDirty, checkAndUnlock, handleModifyWorkout, handleSaveModifiedWorkout, setIsWorkoutEditorOpen,
    ]);

    return (
        <AppStateContext.Provider value={stateValue}>
            <AppDispatchContext.Provider value={dispatchValue}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
};

export const useAppState = (): AppContextState => {
    const context = useContext(AppStateContext);
    if (context === undefined) throw new Error('useAppState must be used within an AppProvider');
    return context;
};

export const useAppDispatch = (): AppContextDispatch => {
    const context = useContext(AppDispatchContext);
    if (context === undefined) throw new Error('useAppDispatch must be used within an AppProvider');
    return context;
};

export const useAppContext = (): AppContextState & AppContextDispatch => {
    return { ...useAppState(), ...useAppDispatch() };
};