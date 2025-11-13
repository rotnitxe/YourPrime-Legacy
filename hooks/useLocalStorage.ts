import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { ExerciseMuscleInfo } from '../types';

/**
 * A robust, performant hook for persisting state to Capacitor's Preferences or localStorage.
 *
 * Key features:
 * 1. **Asynchronous Operations:** All storage interactions are handled in `useEffect`
 *    hooks to prevent blocking the main thread during component renders.
 * 2. **Immediate Writes:** Changes are saved to storage without a debounce. This prevents
 *    data loss on rapid navigation which could previously cancel a pending debounced write.
 * 3. **Safe Initialization:** It loads data on mount and avoids writing the initial
 *    state back to storage until a genuine change occurs.
 * 4. **Smart Merging:** Retains the logic to merge initial default values with stored
 *    values, ensuring new app settings are correctly applied to existing users
 *    without overwriting their saved preferences.
 * 5. **Exit Save:** Implements an immediate, non-debounced save on `visibilitychange`
 *    and Capacitor's `appStateChange` events to prevent data loss if the app is closed abruptly.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);
  const valueRef = useRef(storedValue);

  // Update ref whenever storedValue changes
  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);

  // Effect for reading the value from storage ONCE on initial mount.
  useEffect(() => {
    let isMounted = true;
    const loadValue = async () => {
      try {
        const item = await storageService.get<T>(key);
        if (isMounted) {
          if (item !== null && item !== undefined) {
            // Smart merge for objects to handle app updates gracefully
            if (
              typeof initialValue === 'object' && !Array.isArray(initialValue) && initialValue !== null &&
              typeof item === 'object' && !Array.isArray(item) && item !== null
            ) {
              setStoredValue({ ...initialValue, ...item });
            } else {
              setStoredValue(item);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading key "${key}" from storage`, error);
        // If reading fails, we still have the initialValue
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadValue();
    
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Effect for writing during normal app usage.
  useEffect(() => {
    // Prevent writing the initial value back to storage on the first render cycle.
    // A genuine change must occur first.
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

    if (isLoading) return;

    storageService.set(key, storedValue);
  }, [key, storedValue, isLoading]);
  
  // Effect for immediate saving on app hide/close to prevent data loss.
  useEffect(() => {
    const handleAppHidden = () => {
        if (!isLoading) {
            // Use the ref to get the absolute latest value, bypassing state closure issues.
            storageService.set(key, valueRef.current);
            console.log(`Immediately saved state for key "${key}" on app exit.`);
        }
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            handleAppHidden();
        }
    };
    
    let appStateListener: PluginListenerHandle | null = null;
    
    if (Capacitor.isNativePlatform()) {
        CapApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive) {
                handleAppHidden();
            }
        }).then(listener => appStateListener = listener);
    }

    // `beforeunload` is a more reliable event for desktop browsers when a tab is closed.
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleAppHidden);

    return () => {
        if (appStateListener) {
            appStateListener.remove();
        }
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleAppHidden);
    };
  // We only want this effect to set up listeners once.
  // The logic inside uses a ref, so it doesn't need dependencies on the state itself.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isLoading]);


  return [storedValue, setStoredValue, isLoading];
}

export default useLocalStorage;
