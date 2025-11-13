// components/ContextualActionBars.tsx
import React from 'react';
import { TabBarActions } from '../types';
import {
    CheckCircleIcon, XCircleIcon, PencilIcon, ClockIcon, ZapIcon, PlusIcon,
    CoachIcon, PlusCircleIcon, ClipboardPlusIcon, PaletteIcon, PauseIcon
} from './icons';

// --- EXISTING COMPONENTS (for main TabBar) ---

export const WorkoutSessionActionBar: React.FC<{ actions: TabBarActions }> = ({ actions }) => {
    const actionButtons = [
        { action: actions.onModifyPress, icon: PencilIcon, label: "Modificar" },
        { action: actions.onTimeSaverPress, icon: ZapIcon, label: "Ahorrar" },
        { action: actions.onPauseWorkoutPress, icon: PauseIcon, label: "Pausar" },
        { action: actions.onCancelWorkoutPress, icon: XCircleIcon, label: "Cancelar" },
    ];
    
    return (
        <div className="grid grid-cols-5 items-center h-full text-slate-300">
            {actionButtons.slice(0, 2).map(btn => {
                const Icon = btn.icon;
                return (
                    <button key={btn.label} onClick={btn.action} className="flex flex-col items-center justify-center h-full transition-colors hover:text-white">
                        <Icon size={24}/> <span className="text-[10px] mt-1 font-semibold">{btn.label}</span>
                    </button>
                );
            })}
            
            <div className="col-start-3 flex justify-center items-center">
                 <button onClick={actions.onFinishWorkoutPress} className="prime-action-button w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center text-white" style={{ backgroundImage: 'var(--success-gradient)'}}>
                    <CheckCircleIcon size={40}/>
                </button>
            </div>
            
            {actionButtons.slice(2, 4).map(btn => {
                const Icon = btn.icon;
                return (
                    <button key={btn.label} onClick={btn.action} className="flex flex-col items-center justify-center h-full transition-colors hover:text-white">
                        <Icon size={24}/> <span className="text-[10px] mt-1 font-semibold">{btn.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export const EditorActionBar: React.FC<{ context: 'session-editor' | 'log-workout', actions: TabBarActions }> = ({ context, actions }) => {
    
    const slots = Array(5).fill(null);
    
    slots[0] = { 
        action: actions.onCancelEditPress, 
        icon: XCircleIcon, 
        label: 'Cancelar', 
        className: 'hover:text-red-400' 
    };
    
    const centralAction = context === 'log-workout' ? actions.onSaveLoggedWorkoutPress : actions.onSaveSessionPress;
    const CentralIcon = CheckCircleIcon;

    slots[4] = { action: actions.onAddExercisePress, icon: PlusCircleIcon, label: 'Ejercicio', className: 'hover:text-white' };

    const LeftButtonIcon = slots[0]?.icon;
    const RightButtonIcon = slots[4]?.icon;

    return (
        <div className="grid grid-cols-5 items-center h-full text-slate-300">
            {/* Left Button */}
            {slots[0] && LeftButtonIcon && (
                 <button onClick={slots[0].action} className={`flex flex-col items-center justify-center h-full transition-colors ${slots[0].className || ''}`}>
                    <LeftButtonIcon size={24}/>
                    <span className="text-[10px] mt-1 font-semibold">{slots[0].label}</span>
                </button>
            )}
            <div/>

            {/* Central Button */}
            <div className="flex justify-center items-center">
                <button onClick={centralAction} className="prime-action-button w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center text-white">
                    <CentralIcon size={40}/>
                </button>
            </div>

            <div/>
            {/* Right Button */}
            {slots[4] && context === 'session-editor' && RightButtonIcon && (
                 <button onClick={slots[4].action} className={`flex flex-col items-center justify-center h-full transition-colors ${slots[4].className || ''}`}>
                    <RightButtonIcon size={24}/>
                    <span className="text-[10px] mt-1 font-semibold">{slots[4].label}</span>
                </button>
            )}
        </div>
    );
};


// --- NEW CONFIG FUNCTIONS (for SubTabBar) ---

export interface ActionButtonConfig {
  action?: () => void;
  icon?: React.FC<any>;
  label: string;
  isPrimary?: boolean;
  className?: string;
}

export const getProgramEditorActions = (actions: TabBarActions): ActionButtonConfig[] => {
    return [
        { action: actions.onCancelEditPress, icon: XCircleIcon, label: 'Cancelar', className: 'bg-slate-600 hover:bg-slate-500' },
        { action: actions.onSaveProgramPress, icon: CheckCircleIcon, label: 'Guardar', isPrimary: true }
    ];
};

export const getYourLabActions = (actions: TabBarActions): ActionButtonConfig[] => {
    return [
        { 
            action: actions.onAddCustomExercisePress, 
            icon: PlusIcon, 
            label: 'Nuevo Ejercicio',
            isPrimary: true
        }
    ];
};

export const getExerciseDetailActions = (actions: TabBarActions): ActionButtonConfig[] => {
    return [
        { action: actions.onEditExercisePress, icon: PencilIcon, label: "Editar" },
        { action: actions.onAddToPlaylistPress, icon: ClipboardPlusIcon, label: "Añadir a Lista" },
    ];
};

export const getFeedActions = (actions: TabBarActions): ActionButtonConfig[] => {
    return [
        { action: actions.onCreatePostPress, label: 'Crear Post', isPrimary: true },
        { action: actions.onCustomizeFeedPress, label: 'Personalizar' }
    ];
};