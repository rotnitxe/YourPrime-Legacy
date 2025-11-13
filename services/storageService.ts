// services/storageService.ts
import { Capacitor } from '@capacitor/core';
import { Program, WorkoutLog, Settings, BodyProgressLog, NutritionLog } from '../types';

export const storageService = {
  async set(key: string, value: any): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: JSON.stringify(value) });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error(`Error setting key "${key}" in storage`, e);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) as T : null;
      } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) as T : null;
      }
    } catch (e) {
      console.error(`Error getting or parsing key "${key}" from storage`, e);
    }
    return null;
  },

  async remove(key: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error(`Error removing key "${key}" from storage`, e);
    }
  },
  
  async getAllKeys(): Promise<string[]> {
    if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        const { keys } = await Preferences.keys();
        return keys;
    } else {
        return Object.keys(localStorage);
    }
  },

  async getAllDataForExport(): Promise<Record<string, any>> {
    const keys = await this.getAllKeys();
    const data: Record<string, any> = {};
    const relevantKeys = ['programs', 'history', 'yourprime-settings', 'body-progress', 'nutrition-logs', 'skipped-logs'];
    for (const key of keys) {
      if (relevantKeys.includes(key)) {
         data[key] = await this.get(key);
      }
    }
    // Ensure consistent naming for export file
    if(data['yourprime-settings']) {
      data['settings'] = data['yourprime-settings'];
      delete data['yourprime-settings'];
    }
    return data;
  }
};