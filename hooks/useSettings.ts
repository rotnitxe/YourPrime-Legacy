// hooks/useSettings.ts
import { useCallback } from 'react';
import { Settings } from '../types';
import useLocalStorage from './useLocalStorage';

const SETTINGS_KEY = 'yourprime-settings';

const defaultSettings: Settings = {
  soundsEnabled: true,
  weightUnit: 'kg',
  barbellWeight: 20,
  showTimeSaverPrompt: true,
  gymName: '',
  // Header Customization Defaults
  headerText: 'YourPrime',
  headerStyle: 'default',
  headerFontSize: 2.25, // rem
  headerFontWeight: 700,
  headerGlowIntensity: 5,
  headerCustomBgEnabled: false,
  headerCustomBgColor: '#121212',
  headerBgOpacity: 0.65,
  headerBgBlur: 24,
  // New UI Customization
  cardThemeColor: '#1A1D2A', // Default dark slate blue
  cardBgOpacity: 0.65,
  cardBgBlur: 40,
  userVitals: {},
  calorieGoalObjective: 'maintenance',
  startWeekOn: 'lunes',
  remindersEnabled: false,
  reminderTime: '17:00',
  autoSyncEnabled: false,
  googleClientId: '',
  appBackground: undefined,
  enableParallax: true,
  // New general settings defaults
  hapticFeedbackEnabled: true,
  showPRsInWorkout: true,
  readinessCheckEnabled: true,
  // AI Provider Settings
  apiProvider: 'gemini',
  fallbackEnabled: true,
  apiKeys: {
    gemini: '',
    deepseek: '',
    gpt: '',
  },
  // Advanced Theme Settings
  themePrimaryColor: '#8B5CF6', // Default purple
  themeTextColor: '#F1F5F9', // Default slate-100
  themeBgGradientStart: '#111118',
  themeBgGradientEnd: '#0D0D1A',
  themeFontFamily: 'System',
  themeCardStyle: 'glass',
  themeCardBorderRadius: 1.25,
  themeTabBarColor: '#172554', // Default dark blue
  // Missing properties added
  workoutLoggerMode: 'simple',
  enableGlassmorphism: true,
  enableAnimations: true,
  enableGlowEffects: true,
  enableZenMode: false,
};

function useSettings(): [Settings, (newSettings: Partial<Settings>) => void, boolean] {
  const [settings, setSettingsState, isLoading] = useLocalStorage<Settings>(SETTINGS_KEY, defaultSettings);

  const setSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettingsState(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, [setSettingsState]);

  return [settings, setSettings, isLoading];
}

export default useSettings;