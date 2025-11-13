// App.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useAppState, useAppDispatch } from './contexts/AppContext';
// FIX: Imported the 'Program' and 'WorkoutLog' types to resolve a 'Cannot find name' error.
import { View, Settings, Session, ExerciseMuscleInfo, OngoingWorkoutState, Program, TabBarActions, WorkoutLog, Macrocycle, Mesocycle, ProgramWeek } from './types';
import useAchievements from './hooks/useAchievements';
import { pSBC } from './utils/colorUtils';
import useLocalStorage from './hooks/useLocalStorage';


// Import UI Components
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import SubTabBar from './components/SubTabBar';
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


// Icons for header
// FIX: Import SaveIcon to fix missing member error.
import { ArrowLeftIcon, PlayIcon, PauseIcon, XIcon, SaveIcon, PlusIcon } from './components/icons';

// --- Static Imports for Performance ---
import Home from './components/Home';
import ProgramDetail from './components/ProgramDetail';
import ProgramEditor from './components/ProgramEditor';
// FIX: Import SessionEditor to resolve 'Cannot find name' error.
import SessionEditor from './components/SessionEditor';
// FIX: Module '"file:///components/WorkoutSession"' has no default export. Changed to a named import.
import { WorkoutSession } from './components/WorkoutSession';
import SettingsComponent from './components/Settings';
import CoachView from './components/CoachView';
import PhysicalProgress from './components/PhysicalProgress';
import LogHub from './components/LogHub';
import AchievementsView from './components/AchievementsView';
import LogWorkoutView from './components/LogWorkoutView';
import YourLab from './components/YourLab';
import FeedView from './components/FeedView';
// FIX: Changed to a named import to resolve a module loading issue.
import { ExerciseDetailView } from './components/ExerciseDetailView';
import MuscleGroupDetailView from './components/MuscleGroupDetailView';
import HallOfFameView from './components/HallOfFameView';
import BodyPartDetailView from './components/BodyPartDetailView';
import MuscleCategoryView from './components/MuscleCategoryView';
import ChainDetailView from './components/ChainDetailView';
import CreatePostModal from './components/CreatePostModal';
import EditPostModal from './components/EditPostModal';
// FIX: Changed to a named import to resolve a module loading issue.
import { FeedCustomizationSheet } from './components/FeedCustomizationSheet';
import Button from './components/ui/Button';
import MuscleListEditorModal from './components/MuscleListEditorModal';
import BodyLabView from './components/BodyLabView';
import TrainingPurposeView from './components/TrainingPurposeView';
import ExerciseDatabaseView from './components/ExerciseDatabaseView';
import TasksView from './components/TasksView';
import SessionDetailView from './components/SessionDetailView';
import SmartMealPlannerView from './components/SmartMealPlannerView';

const MobilityLabView = React.lazy(() => import('./components/MobilityLabView'));


const Header: React.FC<{
    isTopLevelView: boolean;
    settings: Settings;
    view: View;
    activeSession: Session | null;
    isOnline: boolean;
    onMenuClick: () => void;
    onBackClick: () => void;
}> = React.memo(({ isTopLevelView, settings, view, activeSession, isOnline, onMenuClick, onBackClick }) => {
    const headerStyle: React.CSSProperties = {
        fontSize: `${settings.headerFontSize}rem`, fontWeight: settings.headerFontWeight,
        '--header-glow-intensity': `${settings.headerGlowIntensity}px`,
    } as React.CSSProperties;
    
    const isSpecialViewWithCustomHeader = ['your-lab', 'mobility-lab', 'exercise-database', 'smart-meal-planner'].includes(view);

    if (isSpecialViewWithCustomHeader) {
        return null;
    }

    const bgStyle: React.CSSProperties = {
        backgroundColor: settings.headerCustomBgEnabled ? settings.headerCustomBgColor : 'var(--header-bg-color-fallback)',
        backdropFilter: `blur(${settings.headerBgBlur}px)`,
        borderBottom: `1px solid var(--header-border-color-fallback)`
    };
    
    const title = settings.headerText;
    const isLongTitle = title.length > 15;

    return (
        <header style={bgStyle} className="app-header flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-2">
                {isTopLevelView ? (
                     <button onClick={onMenuClick} className="p-2 text-slate-300">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                     </button>
                ) : (
                    <button onClick={onBackClick} className="p-2 text-slate-300">
                        <ArrowLeftIcon />
                    </button>
                )}
                 {!isOnline && (
                    <div className="text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full animate-pulse">Offline</div>
                )}
            </div>
             <div className="session-header-title overflow-hidden">
                <h1 style={headerStyle} className={`main-logo header-style-${settings.headerStyle} ${isLongTitle ? 'header-marquee' : ''}`}>{title}</h1>
            </div>
            <div className="w-8" />
        </header>
    );
});

// Helper function to get HUE from a HEX color
const hexToHue = (H: string | undefined): number => {
    if (!H) return 280;
    // Convert hex to RGB first
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

    // Then to HSL
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
        // FIX: Destructure missing properties to satisfy AppContextState type.
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
        // FIX: Destructure missing properties to satisfy AppContextDispatch type.
        handleModifyWorkout,
        handleSaveModifiedWorkout,
        setIsWorkoutEditorOpen,
        closeMuscleListEditor,
    } = dispatch;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    // Effect for Card Theme Color System (Old and New properties combined)
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const color = settings.cardThemeColor || '#1A1D2A';
        const opacity = settings.cardBgOpacity ?? 0.65;
        const blur = settings.cardBgBlur ?? 40;

        // Reset styles first
        body.style.backgroundImage = '';
        root.style.removeProperty('--card-bg-main');
        root.style.removeProperty('--card-bg-light');
        root.style.removeProperty('--card-nested-bg');
        root.style.removeProperty('--card-border');

        if (color.startsWith('linear-gradient')) {
            root.style.setProperty('--card-bg-main', color);
            root.style.setProperty('--card-bg-light', color);
            root.style.setProperty('--card-nested-bg', 'rgba(10, 11, 17, 0.5)');
            root.style.setProperty('--card-border', 'rgba(60, 64, 87, 0.2)');
        } else if (color.startsWith('data:image/svg+xml')) {
            body.style.backgroundImage = `url("${color}")`;
        } else if (color.startsWith('#')) {
            const toRgba = (rgbStr: string | null, alpha: number): string | null => {
                if (!rgbStr) return null;
                return rgbStr.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            };

            const mainRgba = toRgba(pSBC(0, color), opacity);
            const lightRgba = toRgba(pSBC(0.15, color), opacity + 0.1); // Make light version slightly more opaque
            const nestedRgba = toRgba(pSBC(-0.6, color), opacity - 0.15);
            const borderRgba = toRgba(pSBC(0.1, color), 0.2);

            if (mainRgba) root.style.setProperty('--card-bg-main', mainRgba);
            if (lightRgba) root.style.setProperty('--card-bg-light', lightRgba);
            if (nestedRgba) root.style.setProperty('--card-nested-bg', nestedRgba);
            if (borderRgba) root.style.setProperty('--card-border', borderRgba);
        }
        
        // Apply blur
        root.style.setProperty('--card-backdrop-filter', `blur(${blur}px)`);

    }, [settings.cardThemeColor, settings.cardBgOpacity, settings.cardBgBlur]);
    
    // Effect for New Advanced Theme System
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const { 
            themePrimaryColor, themeTextColor, themeBgGradientStart, themeBgGradientEnd, 
            themeFontFamily, themeCardStyle, themeCardBorderRadius 
        } = settings;

        // Primary Color (via HUE)
        root.style.setProperty('--primary-hue', String(hexToHue(themePrimaryColor)));
        
        // Text Color
        if (themeTextColor) root.style.setProperty('--text-color', themeTextColor); else root.style.removeProperty('--text-color');

        // Background
        if (themeBgGradientStart && themeBgGradientEnd) {
            root.style.setProperty('--bg-gradient', `linear-gradient(180deg, ${themeBgGradientStart}, ${themeBgGradientEnd})`);
            root.style.setProperty('--bg-color', themeBgGradientEnd);
        } else {
            root.style.removeProperty('--bg-gradient');
            root.style.removeProperty('--bg-color');
        }
        
        // Font
        if (themeFontFamily && themeFontFamily !== 'System') body.style.fontFamily = `'${themeFontFamily}', var(--font-family-system)`;
        else body.style.fontFamily = `var(--font-family-system)`;

        // Card Border Radius
        if (themeCardBorderRadius) root.style.setProperty('--theme-card-border-radius', `${themeCardBorderRadius}rem`); else root.style.removeProperty('--theme-card-border-radius');
        
        // Card Style
        if (themeCardStyle === 'solid') {
            root.style.setProperty('--card-bg-main', 'rgba(28, 28, 40, 0.95)');
            root.style.setProperty('--card-bg-light', 'rgba(40, 40, 55, 1)');
            root.style.setProperty('--card-backdrop-filter', 'none');
        } else if (themeCardStyle === 'outline') {
            root.style.setProperty('--card-bg-main', 'transparent');
            root.style.setProperty('--card-bg-light', 'rgba(255, 255, 255, 0.05)');
            root.style.setProperty('--card-backdrop-filter', 'none');
        } else { // glass (default)
            // This is now handled by the other useEffect
        }
    }, [settings.themePrimaryColor, settings.themeTextColor, settings.themeBgGradientStart, settings.themeBgGradientEnd, settings.themeFontFamily, settings.themeCardStyle, settings.themeCardBorderRadius]);

    // Parallax Effect for user-defined backgrounds
    useEffect(() => {
        const mainEl = mainContentRef.current;
        const isParallaxEnabled = settings.enableParallax && settings.appBackground?.type === 'image';

        if (!mainEl || !isParallaxEnabled) return;

        const bgElement1 = document.getElementById('app-background-1');
        const bgElement2 = document.getElementById('app-background-2');

        const handleScroll = () => {
            const scrollTop = mainEl.scrollTop;
            const parallaxOffset = scrollTop * 0.2;
            
            if (bgElement1 && bgElement1.classList.contains('visible')) {
                bgElement1.style.transform = `scale(1.1) translateY(${parallaxOffset}px)`;
            }
            if (bgElement2 && bgElement2.classList.contains('visible')) {
                bgElement2.style.transform = `scale(1.1) translateY(${parallaxOffset}px)`;
            }
        };

        mainEl.addEventListener('scroll', handleScroll, { passive: true });
        
        // Reset transform on cleanup
        return () => {
            mainEl.removeEventListener('scroll', handleScroll);
            if (bgElement1) bgElement1.style.transform = 'scale(1.1)';
            if (bgElement2) bgElement2.style.transform = 'scale(1.1)';
        };
    }, [settings.enableParallax, settings.appBackground]);


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
        
        const timer = setTimeout(() => {
            if (mainEl) {
                mainEl.scrollTop = savedPosition;
            }
        }, 10);
        
        return () => {
            clearTimeout(timer);
            if (mainEl) {
                setScrollPosition(viewRef.current, mainEl.scrollTop);
            }
        };
    }, [view, scrollPositions, setScrollPosition]);

    useEffect(() => {
        const anyModalOpen = isBodyLogModalOpen || isNutritionLogModalOpen || isCoachChatOpen || isFinishModalOpen || isTimeSaverModalOpen || isTimersModalOpen || isLogFinishModalOpen || isCustomExerciseEditorOpen || isVideoAnalysisModalOpen || isReadinessModalOpen || state.isAddToPlaylistSheetOpen || isCreatePostModalOpen || isEditPostModalOpen || isFeedCustomizationSheetOpen || isWorkoutEditorOpen || isMuscleListEditorOpen || isMeasurementsModalOpen || isStartWorkoutModalOpen;
        if (anyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isBodyLogModalOpen, isNutritionLogModalOpen, isCoachChatOpen, isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, isLogFinishModalOpen, isCustomExerciseEditorOpen, isVideoAnalysisModalOpen, isReadinessModalOpen, state.isAddToPlaylistSheetOpen, isCreatePostModalOpen, isEditPostModalOpen, isFeedCustomizationSheetOpen, isWorkoutEditorOpen, isMuscleListEditorOpen, isMeasurementsModalOpen, isStartWorkoutModalOpen]);
    
    useEffect(() => {
        // Robust check for orphaned ongoing workouts
        if (!isAppLoading && ongoingWorkout && programs.length > 0 && view === 'home') {
            const program = programs.find(p => p.id === ongoingWorkout.programId);
            if (!program) {
                 console.warn("Ongoing workout found for a deleted program. Clearing state.");
                setOngoingWorkout(null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAppLoading, ongoingWorkout, programs, view]);


    const isTopLevelView = useMemo(() => ['home', 'feed', 'your-lab', 'progress', 'tasks'].includes(view), [view]);
    const onMenuClick = useCallback(() => setIsSidebarOpen(true), []);

    const viewingExercise = useMemo(() => viewingExerciseId ? exerciseList.find(e => e.id === viewingExerciseId) : null, [exerciseList, viewingExerciseId]);

    const onFinishWorkoutPress = useCallback(() => setIsFinishModalOpen(true), [setIsFinishModalOpen]);
    const onTimeSaverPress = useCallback(() => setIsTimeSaverModalOpen(true), [setIsTimeSaverModalOpen]);
    const onSaveSessionPress = useCallback(() => setSaveSessionTrigger(c => c + 1), [setSaveSessionTrigger]);
    const onAddExercisePress = useCallback(() => setAddExerciseTrigger(c => c + 1), [setAddExerciseTrigger]);
    const onSaveProgramPress = useCallback(() => setSaveProgramTrigger(c => c + 1), [setSaveProgramTrigger]);
    const onSaveLoggedWorkoutPress = useCallback(() => setIsLogFinishModalOpen(true), []);
    const onTimersPress = useCallback(() => setIsTimersModalOpen(true), [setIsTimersModalOpen]);
    const onModifyPress = useCallback(() => handleModifyWorkout(), [handleModifyWorkout]);
    const onAddCustomExercisePress = useCallback(() => openCustomExerciseEditor(), [openCustomExerciseEditor]);
    const onCoachPress = useCallback(() => setIsCoachChatOpen(true), []);
    const onPauseWorkoutPress = useCallback(() => handlePauseWorkout(), [handlePauseWorkout]);
    
    const onEditExercisePress = useCallback(() => {
        if (viewingExercise) {
            openCustomExerciseEditor({ exercise: viewingExercise });
        }
    }, [viewingExercise, openCustomExerciseEditor]);

    const onAnalyzeTechniquePress = useCallback(() => setIsVideoAnalysisModalOpen(true), []);
    const onAddToPlaylistPress = useCallback(() => {
        if (viewingExerciseId) {
            setExerciseToAddId(viewingExerciseId);
            setIsAddToPlaylistSheetOpen(true);
        }
    }, [viewingExerciseId, setExerciseToAddId, setIsAddToPlaylistSheetOpen]);

    const onAddToSessionPress = useCallback(() => {
        addToast("Función no implementada todavía.", "suggestion");
    }, [addToast]);
    
    const onCreatePostPress = useCallback(() => setIsCreatePostModalOpen(true), []);
    const onCustomizeFeedPress = useCallback(() => setIsFeedCustomizationSheetOpen(true), []);

    const handleHomeNavigation = (view: View, program?: Program) => {
        if (view === 'program-detail' && program) {
            navigateTo(view, { programId: program.id });
        } else {
            navigateTo(view);
        }
    };

    const tabBarActions: TabBarActions = useMemo(() => ({
        onLogPress: handleLogPress,
        onFinishWorkoutPress,
        onTimeSaverPress,
        onModifyPress,
        onTimersPress,
        onCancelWorkoutPress: onCancelWorkout,
        onPauseWorkoutPress,
        onSaveSessionPress,
        onAddExercisePress,
        onCancelEditPress: handleBack,
        onSaveProgramPress,
        onSaveLoggedWorkoutPress,
        onAddCustomExercisePress,
        onCoachPress,
        onEditExercisePress,
        onAnalyzeTechniquePress,
        onAddToPlaylistPress,
        onAddToSessionPress,
        onCreatePostPress,
        onCustomizeFeedPress,
    }), [
        handleLogPress, onFinishWorkoutPress, onTimeSaverPress, onModifyPress, onTimersPress, onCancelWorkout,
        onPauseWorkoutPress, onSaveSessionPress, onAddExercisePress, handleBack, onSaveProgramPress, onSaveLoggedWorkoutPress,
        onAddCustomExercisePress, onCoachPress, onEditExercisePress, onAnalyzeTechniquePress, onAddToPlaylistPress, onAddToSessionPress,
        onCreatePostPress, onCustomizeFeedPress
    ]);

    const viewsWithSubTabBar = useMemo(() => ['program-editor', 'your-lab', 'exercise-detail', 'feed'], []);
    
    const subTabBarContext = useMemo(() => {
        if (viewsWithSubTabBar.includes(view)) {
            return view as 'program-editor' | 'your-lab' | 'exercise-detail' | 'feed';
        }
        return null;
    }, [view, viewsWithSubTabBar]);

    const tabBarContext = useMemo(() => {
        if (view === 'workout') return 'workout';
        if (view === 'session-editor') return 'session-editor';
        if (view === 'log-workout') return 'log-workout';
        return 'default';
    }, [view]);

    const renderView = useCallback(() => {
        switch (view) {
            case 'home':
                return <Home onNavigate={handleHomeNavigation} onResumeWorkout={handleResumeWorkout} />;
            case 'tasks':
                return <TasksView />;
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
                    return <SessionEditor onSave={handleSaveSession} onCancel={handleBack} existingSessionInfo={sessionInfoForEditor} isOnline={isOnline} settings={settings} saveTrigger={saveSessionTrigger} addExerciseTrigger={addExerciseTrigger} exerciseList={exerciseList} />;
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
                console.log("Workout view rendering null", {sessionToRender, programToRender, activeSession, ongoingWorkout})
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
                return <Suspense fallback={<div className="text-center pt-12">Cargando...</div>}><MobilityLabView /></Suspense>;
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
                // FIX: Use `viewingBodyPartId` which is available in component scope, instead of the undefined `bodyPartId`.
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
    // FIX: Corrected typo from `saveTrigger` to `saveSessionTrigger` in dependency array.
    }, [view, programs, history, skippedLogs, settings, bodyProgress, nutritionLogs, isOnline, handleHomeNavigation, handleResumeWorkout, activeProgramId, handleStartWorkout, handleLogWorkout, handleEditProgram, handleEditSession, handleDeleteSession, handleAddSession, handleDeleteProgram, handleUpdateProgram, handleSaveProgram, handleBack, editingProgramId, saveProgramTrigger, editingSessionInfo, handleSaveSession, saveSessionTrigger, addExerciseTrigger, exerciseList, activeSession, handleFinishWorkout, onCancelWorkout, handleUpdateExercise1RM, isFinishModalOpen, isTimeSaverModalOpen, isTimersModalOpen, handleUpdateExerciseInProgram, setSettings, navigateTo, setIsBodyLogModalOpen, setIsNutritionLogModalOpen, drive, installPromptEvent, setInstallPromptEvent, setPrograms, setHistory, setSkippedLogs, setBodyProgress, setNutritionLogs, unlockedAchievements, loggingSessionInfo, isLogFinishModalOpen, handleSaveLoggedWorkout, viewingExerciseId, viewingMuscleGroupId, viewingBodyPartId, viewingChainId, viewingMuscleCategoryName, ongoingWorkout, viewingSessionInfo]);
    
    const isHeaderHidden = ['your-lab', 'mobility-lab', 'exercise-database', 'smart-meal-planner'].includes(view);
    const mainContentPaddingTop = isHeaderHidden ? '' : 'pt-24';

    const isContextualBar = tabBarContext !== 'default';
    
    const mainContentPaddingBottom = subTabBarContext || isContextualBar ? 'pb-36' : 'pb-28';
    
    const isSubTabBarActive = !!subTabBarContext;
    const tabBarContainerHeight = isSubTabBarActive ? 'h-32' : 'h-24';
    const liquidBackgroundStyle = isSubTabBarActive ? {
        backgroundImage: `linear-gradient(to bottom, hsla(var(--primary-hue, 280), 100%, 70%, 0.2), hsla(var(--primary-hue, 280), 80%, 50%, 0.05) 50%, var(--card-bg-main) 100%)`
    } : {};
    
    const feedStyles: React.CSSProperties = view === 'feed' ? {
        '--card-bg-main': settings.feedSettings?.cardColor,
        '--card-bg-light': settings.feedSettings?.cardColor ? pSBC(0.1, settings.feedSettings.cardColor, null, true) : undefined,
    } as React.CSSProperties : {};
    
    const feedBackgroundClass = view === 'feed' ? settings.feedSettings?.background || '' : '';

    const tabBarStyle: React.CSSProperties = useMemo(() => {
        const color = settings.themeTabBarColor;
        if (!color || !color.startsWith('#')) return {};
        
        const hexToRgba = (hex: string, alpha: number): string => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return {
            background: `linear-gradient(160deg, ${hexToRgba(color, 0.45)}, ${hexToRgba(color, 0.25)})`,
            borderColor: hexToRgba(color, 0.35),
        };
    }, [settings.themeTabBarColor]);

    return (
        <div className={`app-container h-full flex flex-col ${feedBackgroundClass}`}>
            <AppBackground />
            <Header
                isTopLevelView={isTopLevelView}
                settings={settings}
                view={view}
                activeSession={activeSession}
                isOnline={isOnline}
                onMenuClick={onMenuClick}
                onBackClick={handleBack}
            />
             <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navigate={(v) => { navigateTo(v); setIsSidebarOpen(false); }} />

            <main ref={mainContentRef} className={`app-main-content flex-grow ${mainContentPaddingTop} ${mainContentPaddingBottom} px-4 overflow-y-auto`} style={{ viewTransitionName: 'root', ...feedStyles } as React.CSSProperties}>
                {isAppLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-xl font-bold">Cargando...</div>
                    </div>
                ) : (
                    renderView()
                )}
            </main>
            
            <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-2 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div 
                    style={{...liquidBackgroundStyle, ...tabBarStyle}}
                    className={`relative w-full max-w-lg mx-auto pointer-events-auto tab-bar-card-container rounded-3xl transition-all duration-300 ease-in-out ${tabBarContainerHeight}`}
                >
                    <SubTabBar context={subTabBarContext} actions={tabBarActions} isActive={isSubTabBarActive} />
                    <TabBar activeView={view} navigate={navigateTo} context={tabBarContext} actions={tabBarActions} isSubTabBarActive={isSubTabBarActive} />
                </div>
            </div>


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

            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-[9999] space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </div>
    );
}