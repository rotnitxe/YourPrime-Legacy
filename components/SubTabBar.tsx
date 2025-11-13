// components/SubTabBar.tsx
import React from 'react';
import { TabBarActions } from '../types';
import { getProgramEditorActions, getYourLabActions, getExerciseDetailActions, getFeedActions, ActionButtonConfig } from './ContextualActionBars';

interface SubTabBarProps {
  context: 'program-editor' | 'your-lab' | 'exercise-detail' | 'feed' | null;
  actions: TabBarActions;
  isActive: boolean;
}

const SubTabBar: React.FC<SubTabBarProps> = ({ context, actions, isActive }) => {
  if (!context) return null;

  let buttons: ActionButtonConfig[] = [];

  switch (context) {
    case 'program-editor':
      buttons = getProgramEditorActions(actions);
      break;
    case 'your-lab':
      buttons = getYourLabActions(actions);
      break;
    case 'exercise-detail':
      buttons = getExerciseDetailActions(actions);
      break;
    case 'feed':
      buttons = getFeedActions(actions);
      break;
    default:
      return null;
  }

  return (
    <div 
        className={`absolute top-0 left-0 right-0 h-12 w-full transition-all duration-300 ease-in-out
                    ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
        <div 
            className="h-full w-full flex items-center justify-around px-2 gap-2"
        >
            {buttons.map((btn, index) => {
                const baseClasses = 'sub-tab-button h-10 flex-1 flex items-center justify-center text-white text-xs font-semibold rounded-2xl transition-all duration-300 active:scale-95';
                const contextClasses = `${btn.isPrimary ? 'bg-primary-color hover:bg-primary-color/80' : 'bg-slate-700/50 hover:bg-slate-700'} gap-2`;

                return (
                    <button
                        key={btn.label}
                        onClick={btn.action}
                        className={`${baseClasses} ${contextClasses}
                                   ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: isActive ? `${index * 50}ms` : '0ms' }}
                        aria-label={btn.label}
                    >
                        {btn.icon && <btn.icon size={16}/>}
                        <span>{btn.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
  );
};

export default SubTabBar;