
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
  headerFontSize: 2.5, // Larger for Bebas Neue
  headerFontWeight: 400,
  headerGlowIntensity: 0,
  headerCustomBgEnabled: false,
  headerCustomBgColor: '#000000',
  headerBgOpacity: 0.9,
  headerBgBlur: 0,
  // New UI Customization - Deep Black Defaults
  cardThemeColor: '#0A0A0A',
  cardBgOpacity: 1,
  cardBgBlur: 0,
  userVitals: {},
  calorieGoalObjective: 'maintenance',
  startWeekOn: 'lunes',
  remindersEnabled: false,
  reminderTime: '17:00',
  autoSyncEnabled: false,
  googleClientId: '',
  appBackground: { type: 'color', value: '#000000' }, // Force black background
  enableParallax: false, // Disable for static clean look
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
  // Advanced Theme Settings - Deep Black
  themePrimaryColor: '#00E5FF', // Cyan
  themeTextColor: '#FFFFFF', 
  themeBgGradientStart: '#000000',
  themeBgGradientEnd: '#000000',
  themeFontFamily: 'Inter',
  themeCardStyle: 'solid',
  themeCardBorderRadius: 1.0,
  themeTabBarColor: '#0A0A0A',
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
    