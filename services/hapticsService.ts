// services/hapticsService.ts
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { Settings } from '../types';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Export Capacitor enums so they can be used consistently across the app.
export { ImpactStyle, NotificationType };


const canUseHaptics = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const settings = await storageService.get<Settings>('yourprime-settings');
        // Default to true if settings are not found or property is missing
        return settings?.hapticFeedbackEnabled ?? true;
    } catch {
        return true; // Failsafe
    }
}

// Function to trigger a haptic impact feedback
export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!await canUseHaptics()) return;
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.warn("Haptics not available on this device.", error);
  }
};

// Function to trigger a haptic notification feedback
export const hapticNotification = async (type: NotificationType) => {
  if (!await canUseHaptics()) return;
  try {
    await Haptics.notification({ type });
  } catch (error) {
    console.warn("Haptics notification not available on this device.", error);
  }
};

// Function to trigger a haptic feedback for selection changes
export const hapticSelection = async () => {
  if (!await canUseHaptics()) return;
  try {
    await Haptics.selectionStart();
  } catch (error) {
    console.warn("Haptics selection not available on this device.", error);
  }
};