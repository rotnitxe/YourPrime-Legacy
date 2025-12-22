
// App.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useAppState, useAppDispatch } from './contexts/AppContext';
import { View, Session, WorkoutLog, Program, TabBarActions } from './types';
import { pSBC } from './utils/colorUtils';
import useLocalStorage from './hooks/useLocalStorage';

// Import UI Components
import TabBar from './components/TabBar';
import AddBodyLogModal from './components/AddBodyLogModal';
import AddNutritionLogModal from './components/AddNutritionLogModal';
import CoachChatModal from './components/CoachChatModal';
import AppBackground from './components/AppBackground';
import TimersModal from './components/TimersModal';
import Toast from './components/ui/Toast';
import CustomExerciseEditorModal from './components/CustomExerciseEditorModal';
import VideoAnalysisModal from './components/VideoAnalysisModal';
import ReadinessCheckModal from './components/ReadinessCheckModal';
import AddToPlaylistSheet from './components/AddToPlaylistSheet';
import AddMeasurementsModal from './components/AddMeasurementsModal';
import StartWorkoutModal from './components/StartWorkoutModal';
import CreatePostModal from './components/CreatePostModal';
import EditPostModal from './components/EditPostModal';
import { FeedCustomizationSheet } from './components/FeedCustomizationSheet';
import Button from './components/ui/Button';
import MuscleListEditorModal from './components/MuscleListEditorModal';
import { SaveIcon, PlusIcon, XIcon } from './components/icons';

// --- Lazy Imports for Performance ---
const Home = React.lazy(() => import('./components/Home'));
const ProgramDetail = React.lazy(() => import('./components/ProgramDetail'));
const ProgramEditor = React.lazy(() => import('./components/ProgramEditor'));
const SessionEditor = React.lazy(() => import('./components/SessionEditor'));
const WorkoutSession = React.lazy(() => import('./components/WorkoutSession').then(module => ({ default: module.WorkoutSession })));
const SettingsComponent = React.lazy(() => import('./components/Settings'));
const CoachView = React.lazy(() => import('./components/CoachView'));
const PhysicalProgress = React.lazy(() => import('./components/PhysicalProgress'));
const LogHub = React.lazy(() => import('./components/LogHub'));
const AchievementsView = React.lazy(() => import('./components/AchievementsView'));
const LogWorkoutView = React.lazy(() => import('./components/LogWorkoutView'));
const YourLab = React.lazy(() => import('./components/YourLab'));
const FeedView = React.lazy(() => import('./components/FeedView'));
const ExerciseDetailView = React.lazy(() => import('./components/ExerciseDetailView').then(module => ({ default: module.ExerciseDetailView })));
const MuscleGroupDetailView = React.lazy(() => import('./components/MuscleGroupDetailView'));
const HallOfFameView = React.lazy(() => import('./components/HallOfFameView'));
const BodyPartDetailView = React.lazy(() => import('./components/BodyPartDetailView'));
const MuscleCategoryView = React.lazy(() => import('./components/MuscleCategoryView'));
const ChainDetailView = React.lazy(() => import('./components/ChainDetailView'));
const BodyLabView = React.lazy(() => import('./components/BodyLabView'));
const TrainingPurposeView = React.lazy(() => import('./components/TrainingPurposeView'));
const ExerciseDatabaseView = React.lazy(() => import('./components/ExerciseDatabaseView'));
const TasksView = React.lazy(() => import('./components/TasksView'));
const SessionDetailView = React.lazy(() => import('./components/SessionDetailView'));
const SmartMealPlannerView = React.lazy(() => import('./components/SmartMealPlannerView'));
const MobilityLabView = React.lazy(() => import('./components/MobilityLabView'));
const ProgramsView = React.lazy(() => import('./components/ProgramsView'));

// Helper function to get HUE from a HEX color
const hexToHue = (H: string | undefined): number => {
    if (!H) return 280;
    let r = 0, g = 0, b = 0;
    let hStr = H.startsWith('#') ? H.substring(1) : H;
    if (hStr.length === 3) {
        r = parseInt(hStr[0] + hStr[0], 16);
        g = parseInt(hStr[1] + hStr[1], 16);
        b = parseInt(hStr[2] + hStr[2], 16);
    } else if (hStr.length === 6) {
        r = parseInt(hStr.substring(0, 2), 16);
        g = parseInt(hStr.substring(2, 4), 16);
        b = parseInt(hStr.substring(4, 6), 16);
    } else {
        return 280;
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return Math.round(h * 360);
};

export const App: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    
    const [scrollPositions, setScrollPositions] = useLocalStorage<{ [key: string]: number }>('yourprime-scroll-positions', {});
    
    const {
        view,
        activeProgramId,
        editingProgramId,
        editingSessionInfo,
        activeSession,
        loggingSessionInfo,
        viewingSessionInfo,
        viewingExerciseId,
        viewingMuscleGroupId,
        viewingBodyPartId,
        viewingChainId,
        viewingMuscleCategoryName,
        settings,
        programs,
        history,
        unlockedAchievements,
        skippedLogs,
        bodyProgress,
        nutritionLogs,
        exerciseList,
        isOnline,
        isFinishModalOpen,
        isTimeSaverModalOpen,
        isTimersModalOpen,
        isReadinessModalOpen,
        isAppLoading,
        installPromptEvent,
        toasts,
        saveSessionTrigger,
        addExerciseTrigger,
        saveProgramTrigger,
        saveLoggedWorkoutTrigger,
        drive,
        ongoingWorkout,
        isCustomExerciseEditorOpen,
        editingCustomExerciseData,
        isMeasurementsModalOpen,
        isStartWorkoutModalOpen,
        isWorkoutEditorOpen,
        editingWorkoutSessionInfo,
        isMuscleListEditorOpen,
        editingCategoryInfo,
    } = state;
    
    const {
        navigateTo,
        setIsFinishModalOpen,
        setIsTimeSaverModalOpen,
        setIsTimersModalOpen,
        setIsReadinessModalOpen,
        setIsMeasurementsModalOpen,
        setIsStartWorkoutModalOpen,
        setBiomechanicalData,
        handleLogPress,
        handleSelectProgram,
        handleSaveProgram,
        handleDeleteProgram,
        handleAddSession,
        handleEditSession,
        handleSaveSession,
        handleDeleteSession,
        handleStartWorkout,
        handleResumeWorkout,
        handleContinueFromReadiness,
        handleLogWorkout,
        handleSkipWorkout,
        handleFinishWorkout,
        handlePauseWorkout,
        handleSaveLoggedWorkout,
        handleUpdateExerciseInProgram,
        onCancelWorkout,
        handleUpdateExercise1RM,
        handleBack,
        setPrograms,
        setHistory,
        setSkippedLogs,
        setBodyProgress,
        setNutritionLogs,
        setInstallPromptEvent,
        setSettings,
        handleSaveNutritionLog,
        handleSaveBodyLog,
        handleCreateProgram,
        handleEditProgram,
        handleUpdateProgram,
        removeToast,
        addToast,
        setSaveSessionTrigger,
        setAddExerciseTrigger,
        setSaveProgramTrigger,
        setSaveLoggedWorkoutTrigger,
        setOngoingWorkout,
        addOrUpdateCustomExercise,
        setIsAddToPlaylistSheetOpen,
        setExerciseToAddId,
        openCustomExerciseEditor,
        closeCustomExerciseEditor,
        handleUpdatePost,
        handleModifyWorkout,
        handleSaveModifiedWorkout,
        setIsWorkoutEditorOpen,
        closeMuscleListEditor,
    } = dispatch;

    const [isCoachChatOpen, setIsCoachChatOpen] = useState(false);
    const [isBodyLogModalOpen, setIsBodyLogModalOpen] = useState(false);
    const [isNutritionLogModalOpen, setIsNutritionLogModalOpen] = useState(false);
    const [isLogFinishModalOpen, setIsLogFinishModalOpen] = useState(false);
    const [isVideoAnalysisModalOpen, setIsVideoAnalysisModalOpen] = useState(false);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<WorkoutLog | null>(null);
    const [isFeedCustomizationSheetOpen, setIsFeedCustomizationSheetOpen] = useState(false);
    const [modifyWorkoutTrigger, setModifyWorkoutTrigger] = useState(0);
    const [addExerciseTriggerInModal, setAddExerciseTriggerInModal] = useState(0);

    const mainContentRef = useRef<HTMLElement>(null);
    const viewRef = useRef(view);

    // Apply Global Theme Settings (CSS Variables)
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const { 
            themePrimaryColor, themeTextColor, themeFontFamily, themeCardBorderRadius 
        } = settings;

        root.style.setProperty('--primary-hue', String(hexToHue(themePrimaryColor)));
        if (themeTextColor) root.style.setProperty('--text-color', themeTextColor); 
        else root.style.removeProperty('--text-color');

        if (themeFontFamily && themeFontFamily !== 'System') body.style.fontFamily = `'${themeFontFamily}', var(--font-family-system)`;
        else body.style.fontFamily = `var(--font-family-system)`;

        if (themeCardBorderRadius) root.style.setProperty('--theme-card-border-radius', `${themeCardBorderRadius}rem`); 
        else root.style.removeProperty('--theme-card-border-radius');
        
    }, [settings]);

    // Save/Restore Scroll Position
    const setScrollPosition = useCallback((key: string, position: number) => {
        setScrollPositions(prev => ({ ...prev, [key]: position }));
    }, [setScrollPositions]);

    useEffect(() => {
        viewRef.current = view;
    }, [view]);

    useEffect(() => {
        const mainEl = mainContentRef.current;
        if (!mainEl) return;
        
        const savedPosition = scrollPositions[view] || 0;
        // Small delay to ensure content is rendered
        const timer = setTimeout(() => {
            if (mainEl) mainEl.scrollTop = savedPosition;
        }, 10);
        
        return () => {
            clearTimeout(timer);
            if (mainEl) setScrollPosition(viewRef.current, mainEl.scrollTop);
        };
    }, [view, scrollPositions, setScrollPosition]);

    // Prevent body scroll when modals are open
    useEffect(() => {
        const anyModalOpen = isBodyLogModalOpen || isNutritionLogModalOpen || isCoachChatOpen || isFinishModalOpen || isTimeSaverModalOpen || isTimersModalOpen || isLogFinishModalOpen || isCustomExerciseEditorOpen || isVideoAnalysisModalOpen || isReadinessModalOpen || state.isAddToPlaylistSheetOpen || isCreatePostModalOpen || isEditPostModalOpen || isFeedCustomizationSheetOpen || isWorkoutEditorOpen || isMuscleListEditorOpen || isMeasurementsModalOpen || isStartWorkoutModalOpen;
        document.body.style.overflow = anyModalOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isBodyLogModalOpen, isNutritionLogModalOpen, isCoachChatOpen, isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, isLogFinishModalOpen, isCustomExerciseEditorOpen, isVideoAnalysisModalOpen, isReadinessModalOpen, state.isAddToPlaylistSheetOpen, isCreatePostModalOpen, isEditPostModalOpen, isFeedCustomizationSheetOpen, isWorkoutEditorOpen, isMuscleListEditorOpen, isMeasurementsModalOpen, isStartWorkoutModalOpen]);
    
    // Cleanup ongoing workout if program deleted
    useEffect(() => {
        if (!isAppLoading && ongoingWorkout && programs.length > 0 && view === 'home') {
            const program = programs.find(p => p.id === ongoingWorkout.programId);
            if (!program) {
                 console.warn("Ongoing workout found for a deleted program. Clearing state.");
                setOngoingWorkout(null);
            }
        }
    }, [isAppLoading, ongoingWorkout, programs, view, setOngoingWorkout]);

    const viewingExercise = useMemo(() => viewingExerciseId ? exerciseList.find(e => e.id === viewingExerciseId) : null, [exerciseList, viewingExerciseId]);

    // Navigation Handlers
    const handleHomeNavigation = (view: View, program?: Program) => {
        if (view === 'program-detail' && program) {
            navigateTo(view, { programId: program.id });
        } else {
            navigateTo(view);
        }
    };

    // Render Logic
    const renderView = useCallback(() => {
        switch (view) {
            case 'home':
                return <Home onNavigate={handleHomeNavigation} onResumeWorkout={handleResumeWorkout} />;
            case 'tasks':
                return <TasksView />;
            case 'programs':
                return <ProgramsView programs={programs} onSelectProgram={(p) => navigateTo('program-detail', { programId: p.id })} onCreateProgram={handleCreateProgram} isOnline={isOnline} />;
            case 'program-detail':
                const program = programs.find(p => p.id === activeProgramId);
                return program && <ProgramDetail program={program} history={history} settings={settings} isOnline={isOnline} onStartWorkout={handleStartWorkout} onLogWorkout={handleLogWorkout} onEditProgram={handleEditProgram} onEditSession={handleEditSession} onDeleteSession={handleDeleteSession} onAddSession={handleAddSession} onDeleteProgram={handleDeleteProgram} onUpdateProgram={handleUpdateProgram} />;
            case 'program-editor':
                 const programToEdit = editingProgramId ? programs.find(p => p.id === editingProgramId) : null;
                return <ProgramEditor onSave={handleSaveProgram} onCancel={handleBack} existingProgram={programToEdit} isOnline={isOnline} saveTrigger={saveProgramTrigger} />;
            case 'session-editor': {
                if (editingSessionInfo) {
                    const { programId, macroIndex, mesoIndex, weekId, sessionId } = editingSessionInfo;
                    const program = programs.find(p => p.id === programId);
                    const session = sessionId ? program?.macrocycles[macroIndex]?.mesocycles[mesoIndex]?.weeks.find(w => w.id === weekId)?.sessions.find(s => s.id === sessionId) : undefined;
                    const sessionInfoForEditor = {
                        session: session || { id: crypto.randomUUID(), name: 'Nueva Sesión', description: '', exercises: [], warmup: [] },
                        programId, macroIndex, mesoIndex, weekId
                    };
                    return <SessionEditor onSave={(session) => handleSaveSession(session, programId, macroIndex, mesoIndex, weekId)} onCancel={handleBack} existingSessionInfo={sessionInfoForEditor} isOnline={isOnline} settings={settings} saveTrigger={saveSessionTrigger} addExerciseTrigger={addExerciseTrigger} exerciseList={exerciseList} />;
                }
                return null;
            }
            case 'workout': {
                const programToRender = ongoingWorkout ? programs.find(p => p.id === ongoingWorkout.programId) : null;
                const sessionToRender = activeSession || ongoingWorkout?.session;

                if (sessionToRender && programToRender) {
                    return <WorkoutSession 
                        session={sessionToRender} 
                        program={programToRender} 
                        programId={programToRender.id} 
                        programName={programToRender.name} 
                        settings={settings} 
                        isOnline={isOnline} 
                        history={history} 
                        onFinish={handleFinishWorkout} 
                        onCancel={onCancelWorkout} 
                        onUpdateExercise1RM={handleUpdateExercise1RM} 
                        isFinishModalOpen={isFinishModalOpen} 
                        setIsFinishModalOpen={setIsFinishModalOpen} 
                        isTimeSaverModalOpen={isTimeSaverModalOpen} 
                        setIsTimeSaverModalOpen={setIsTimeSaverModalOpen} 
                        onUpdateExerciseInProgram={handleUpdateExerciseInProgram} 
                        isTimersModalOpen={isTimersModalOpen} 
                        setIsTimersModalOpen={setIsTimersModalOpen} 
                        exerciseList={exerciseList} 
                    />;
                }
                return <div className="text-center text-slate-400 pt-12">Cargando sesión...</div>;
            }
             case 'session-detail':
                return viewingSessionInfo && <SessionDetailView sessionInfo={viewingSessionInfo} />;
            case 'progress':
                return <PhysicalProgress progress={bodyProgress} setProgress={setBodyProgress} nutritionLogs={nutritionLogs} setNutritionLogs={setNutritionLogs} settings={settings} onSettingsChange={setSettings} isOnline={isOnline} programs={programs} history={history} onNavigate={navigateTo} setIsBodyLogModalOpen={setIsBodyLogModalOpen} setIsNutritionLogModalOpen={setIsNutritionLogModalOpen} />;
            case 'settings':
                return <SettingsComponent settings={settings} onSettingsChange={setSettings} setPrograms={setPrograms} setHistory={setHistory} setSkippedLogs={setSkippedLogs} setBodyProgress={setBodyProgress} setNutritionLogs={setNutritionLogs} drive={drive} installPromptEvent={installPromptEvent} setInstallPromptEvent={setInstallPromptEvent} isOnline={isOnline} />;
            case 'coach':
                return <CoachView programs={programs} history={history} skippedLogs={skippedLogs} settings={settings} bodyProgress={bodyProgress} nutritionLogs={nutritionLogs} isOnline={isOnline} />;
            case 'log-hub':
                return <LogHub onNavigate={navigateTo} setIsBodyLogModalOpen={setIsBodyLogModalOpen} setIsNutritionLogModalOpen={setIsNutritionLogModalOpen} />;
            case 'achievements':
                return <AchievementsView unlocked={unlockedAchievements} />;
            case 'log-workout': {
                if (loggingSessionInfo) {
                    const program = programs.find(p => p.id === loggingSessionInfo.programId);
                    const session = program?.macrocycles.flatMap(m => m.mesocycles.flatMap(me => me.weeks.flatMap(w => w.sessions))).find(s => s.id === loggingSessionInfo.sessionId);
                    if (program && session) {
                        return <LogWorkoutView sessionInfo={{ session, program }} settings={settings} history={history} onSave={handleSaveLoggedWorkout} onCancel={handleBack} isFinishModalOpen={isLogFinishModalOpen} setIsFinishModalOpen={setIsLogFinishModalOpen} onUpdateExercise1RM={handleUpdateExercise1RM} onUpdateExerciseInProgram={handleUpdateExerciseInProgram} exerciseList={exerciseList} />;
                    }
                }
                return null;
            }
            case 'your-lab':
                return <YourLab />;
            case 'body-lab':
                return <BodyLabView />;
            case 'mobility-lab':
                return <MobilityLabView />;
            case 'training-purpose':
                return <TrainingPurposeView />;
            case 'exercise-database':
                return <ExerciseDatabaseView />;
            case 'smart-meal-planner':
                return <SmartMealPlannerView />;
            case 'feed':
                 return <FeedView openCreatePostModal={() => setIsCreatePostModalOpen(true)} openEditPostModal={(log) => { setEditingPost(log); setIsEditPostModalOpen(true); }} openCustomizationSheet={() => setIsFeedCustomizationSheetOpen(true)} />;
            case 'exercise-detail':
                return viewingExerciseId && <ExerciseDetailView exerciseId={viewingExerciseId} isOnline={isOnline} />;
            case 'muscle-group-detail':
                return viewingMuscleGroupId && <MuscleGroupDetailView muscleGroupId={viewingMuscleGroupId} isOnline={isOnline} />;
            case 'body-part-detail':
                return viewingBodyPartId && <BodyPartDetailView bodyPartId={viewingBodyPartId as any} />;
            case 'muscle-category':
                return viewingMuscleCategoryName && <MuscleCategoryView categoryName={viewingMuscleCategoryName} />;
            case 'chain-detail':
                return viewingChainId && <ChainDetailView chainId={viewingChainId as any} />;
            case 'hall-of-fame':
                return <HallOfFameView />;
            default:
                return <Home onNavigate={handleHomeNavigation} onResumeWorkout={handleResumeWorkout} />;
        }
    }, [view, programs, history, skippedLogs, settings, bodyProgress, nutritionLogs, isOnline, handleHomeNavigation, handleResumeWorkout, activeProgramId, handleStartWorkout, handleLogWorkout, handleEditProgram, handleEditSession, handleDeleteSession, handleAddSession, handleDeleteProgram, handleUpdateProgram, handleSaveProgram, handleBack, editingProgramId, saveProgramTrigger, editingSessionInfo, handleSaveSession, saveSessionTrigger, addExerciseTrigger, exerciseList, activeSession, handleFinishWorkout, onCancelWorkout, handleUpdateExercise1RM, isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, handleUpdateExerciseInProgram, setSettings, navigateTo, setIsBodyLogModalOpen, setIsNutritionLogModalOpen, drive, installPromptEvent, setInstallPromptEvent, setPrograms, setHistory, setSkippedLogs, setBodyProgress, setNutritionLogs, unlockedAchievements, loggingSessionInfo, isLogFinishModalOpen, handleSaveLoggedWorkout, viewingExerciseId, viewingMuscleGroupId, viewingBodyPartId, viewingChainId, viewingMuscleCategoryName, ongoingWorkout, viewingSessionInfo, handleCreateProgram]);
    
    // Main App Layout Structure V3
    return (
        <div className="relative min-h-screen w-full overflow-hidden text-white font-sans selection:bg-indigo-500/30">
            {/* 1. Fondo Global Fijo */}
            <AppBackground />
            
            {/* 2. Contenido Scrolleable */}
            <main 
                ref={mainContentRef} 
                className="h-screen w-full overflow-y-auto hide-scrollbar scroll-smooth pb-24"
                style={{ viewTransitionName: 'root' }}
            >
                <div className="max-w-md mx-auto min-h-full p-4 relative z-10">
                    {isAppLoading ? (
                        <div className="flex justify-center items-center h-[80vh]">
                            <div className="text-xl font-bold animate-pulse text-slate-400">Cargando...</div>
                        </div>
                    ) : (
                        <Suspense fallback={
                            <div className="flex justify-center items-center h-[80vh]">
                                <div className="text-xl font-bold animate-pulse text-slate-400">Cargando...</div>
                            </div>
                        }>
                            {renderView()}
                        </Suspense>
                    )}
                </div>
            </main>
            
            {/* 3. Navegación Flotante Fija */}
            <TabBar />

            {/* 4. Modales Globales */}
            {isCoachChatOpen && <CoachChatModal isOpen={isCoachChatOpen} onClose={() => setIsCoachChatOpen(false)} programs={programs} history={history} isOnline={isOnline} settings={settings} />}
            {isBodyLogModalOpen && <AddBodyLogModal isOpen={isBodyLogModalOpen} onClose={() => setIsBodyLogModalOpen(false)} onSave={handleSaveBodyLog} settings={settings} />}
            {isNutritionLogModalOpen && <AddNutritionLogModal isOpen={isNutritionLogModalOpen} onClose={() => setIsNutritionLogModalOpen(false)} onSave={handleSaveNutritionLog} isOnline={isOnline} settings={settings} />}
            {isTimersModalOpen && <TimersModal isOpen={isTimersModalOpen} onClose={() => setIsTimersModalOpen(false)} />}
            {isMeasurementsModalOpen && <AddMeasurementsModal isOpen={isMeasurementsModalOpen} onClose={() => setIsMeasurementsModalOpen(false)} onSave={setBiomechanicalData} />}
            {state.pendingWorkoutForReadinessCheck && isReadinessModalOpen && <ReadinessCheckModal isOpen={isReadinessModalOpen} onClose={() => setIsReadinessModalOpen(false)} onContinue={handleContinueFromReadiness} />}
            {state.isAddToPlaylistSheetOpen && <AddToPlaylistSheet />}
            {isStartWorkoutModalOpen && <StartWorkoutModal isOpen={isStartWorkoutModalOpen} onClose={() => setIsStartWorkoutModalOpen(false)} />}
            
            {isCustomExerciseEditorOpen && (
                 <CustomExerciseEditorModal
                    isOpen={isCustomExerciseEditorOpen}
                    onClose={closeCustomExerciseEditor}
                    onSave={addOrUpdateCustomExercise}
                    isOnline={isOnline}
                    existingExercise={editingCustomExerciseData?.exercise}
                    preFilledName={editingCustomExerciseData?.preFilledName}
                 />
            )}
            
            {isVideoAnalysisModalOpen && viewingExercise && (
                 <VideoAnalysisModal
                    isOpen={isVideoAnalysisModalOpen}
                    onClose={() => setIsVideoAnalysisModalOpen(false)}
                    exerciseName={viewingExercise.name}
                    isOnline={isOnline}
                    settings={settings}
                 />
            )}
             {isCreatePostModalOpen && (
                <CreatePostModal isOpen={isCreatePostModalOpen} onClose={() => setIsCreatePostModalOpen(false)} onSave={handleSaveLoggedWorkout} />
            )}
            {isEditPostModalOpen && editingPost && (
                <EditPostModal isOpen={isEditPostModalOpen} onClose={() => setIsEditPostModalOpen(false)} onSave={handleUpdatePost} log={editingPost} />
            )}
            {isFeedCustomizationSheetOpen && (
                <FeedCustomizationSheet isOpen={isFeedCustomizationSheetOpen} onClose={() => setIsFeedCustomizationSheetOpen(false)} />
            )}
            
            {isMuscleListEditorOpen && editingCategoryInfo && (
                <MuscleListEditorModal
                    isOpen={isMuscleListEditorOpen}
                    onClose={closeMuscleListEditor}
                    categoryInfo={editingCategoryInfo}
                />
            )}

            {isWorkoutEditorOpen && editingWorkoutSessionInfo && (
                <>
                    <div className="bottom-sheet-backdrop animate-fade-in" style={{ animationDuration: '0.4s' }} onClick={() => setIsWorkoutEditorOpen(false)} />
                    <div className="bottom-sheet-content open editor-sheet-content" style={{ transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div className="bottom-sheet-grabber" />
                        <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-border-color">
                             <h2 className="text-xl font-bold text-white">Modificar Sesión</h2>
                             <button onClick={() => setIsWorkoutEditorOpen(false)} className="p-2 text-slate-300"><XIcon /></button>
                        </header>
                        <div className="flex-grow overflow-y-auto px-4 pb-20">
                            <Suspense fallback={<div>Cargando editor...</div>}>
                                <SessionEditor
                                    onSave={handleSaveModifiedWorkout}
                                    onCancel={() => setIsWorkoutEditorOpen(false)}
                                    existingSessionInfo={editingWorkoutSessionInfo}
                                    isOnline={isOnline}
                                    settings={settings}
                                    saveTrigger={modifyWorkoutTrigger}
                                    addExerciseTrigger={addExerciseTriggerInModal}
                                    exerciseList={exerciseList}
                                 />
                            </Suspense>
                        </div>
                         <footer className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 flex gap-2">
                             <Button onClick={() => setAddExerciseTriggerInModal(c => c + 1)} variant="secondary" className="flex-1">
                                <PlusIcon /> Añadir Ejercicio
                            </Button>
                            <Button onClick={() => setModifyWorkoutTrigger(c => c + 1)} className="flex-1 !py-3">
                                <SaveIcon /> Guardar Cambios
                            </Button>
                        </footer>
                    </div>
                </>
            )}

            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[9999] space-y-2 pointer-events-none">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </div>
    );
}
