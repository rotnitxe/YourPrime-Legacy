// components/TabBar.tsx
import React from 'react';
import { View, TabBarActions } from '../types';
import { HomeIcon, PlusCircleIcon, TrendingUpIcon, FlaskConical, FeedIcon } from './icons';
import { playSound } from '../services/soundService';
import { hapticSelection } from '../services/hapticsService';
import { WorkoutSessionActionBar, EditorActionBar } from './ContextualActionBars';

interface TabBarProps {
  activeView: View;
  navigate: (view: View) => void;
  context: 'default' | 'workout' | 'session-editor' | 'log-workout';
  actions: TabBarActions;
  isSubTabBarActive?: boolean;
}

const NavButton: React.FC<{
    item: { view: string, icon: React.FC<any>, label: string };
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center h-full text-slate-400 hover:text-white transition-colors"
        aria-label={item.label}
    >
        <item.icon size={24} className={isActive ? 'text-primary-color' : ''} />
        <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-white' : 'text-slate-500'}`}>
            {item.label}
        </span>
    </button>
);

const PrimeNextTabBar: React.FC<TabBarProps> = ({ activeView, navigate, actions }) => {
    const navItems = [
        { view: 'home', icon: HomeIcon, label: 'Hoy' },
        { view: 'feed', icon: FeedIcon, label: 'Feed' },
        { view: 'your-lab', icon: FlaskConical, label: 'YourLab' },
        { view: 'progress', icon: TrendingUpIcon, label: 'Progreso' },
    ];
    
    const handleNavClick = (view: View) => {
        const isActive = activeView === view;
        playSound(isActive ? 'ui-click-sound' : 'tab-switch-sound');
        hapticSelection();
        navigate(view);
    };

    return (
        <div className="grid grid-cols-5 items-center h-full">
            {navItems.slice(0, 2).map(item => (
                <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={() => handleNavClick(item.view as View)} />
            ))}

            <div className="flex justify-center items-center">
                <button onClick={actions.onLogPress} className="prime-action-button w-[72px] h-[72px] rounded-full bg-primary-gradient flex flex-col items-center justify-center text-white transform hover:scale-105 transition-transform">
                    <PlusCircleIcon size={40}/>
                </button>
            </div>
            
            {navItems.slice(2, 4).map(item => (
                <NavButton key={item.view} item={item} isActive={activeView === item.view} onClick={() => handleNavClick(item.view as View)} />
            ))}
        </div>
    );
}

const TabBar: React.FC<TabBarProps> = (props) => {
    const { context, actions } = props;

    let content: React.ReactNode;

    switch (context) {
        case 'workout':
            content = <WorkoutSessionActionBar actions={actions} />;
            break;
        case 'session-editor':
        case 'log-workout':
            content = <EditorActionBar context={context} actions={actions} />;
            break;
        default:
            content = <PrimeNextTabBar {...props} />;
            break;
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 h-24 w-full pointer-events-auto">
            {content}
        </div>
    );
};

export default TabBar;
