// services/soundService.ts
import { Settings } from '../types';
import { storageService } from './storageService';

// Audio context and buffer cache
let audioContext: AudioContext | null = null;
const audioBuffers: { [key: string]: AudioBuffer } = {};

const SOUND_FILES: { [key: string]: string } = {
  'rest-timer-sound': 'https://actions.google.com/sounds/v1/emergency/beeper_confirm.ogg', // Short, non-intrusive beep
  'set-logged-sound': 'https://actions.google.com/sounds/v1/switches/switch_toggle_on.ogg',
  'ui-click-sound': 'https://actions.google.com/sounds/v1/ui/ui_tap_forward.ogg',
  'tab-switch-sound': 'https://actions.google.com/sounds/v1/ui/ui_tap_reverse.ogg',
  'new-pr-sound': 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg',
  'rep-surplus-sound': 'https://actions.google.com/sounds/v1/emergency/beeper_confirm.ogg',
  'session-complete-sound': 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
};

const initAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
  }
  return audioContext;
};

export const playSound = async (soundId: string) => {
  const settings = await storageService.get<Settings>('yourprime-settings');
  if (!settings?.soundsEnabled) return;

  const context = initAudioContext();
  if (!context) return;
  
  // Browsers may suspend the audio context after a period of inactivity.
  // This resumes it if needed.
  if (context.state === 'suspended') {
    await context.resume();
  }

  const soundUrl = SOUND_FILES[soundId];
  if (!soundUrl) {
      console.warn(`Sound with id "${soundId}" not found.`);
      return;
  }

  try {
    let buffer;
    if (audioBuffers[soundId]) {
      buffer = audioBuffers[soundId];
    } else {
      const response = await fetch(soundUrl, { cache: 'force-cache' }); // Cache the sound file
      const arrayBuffer = await response.arrayBuffer();
      buffer = await context.decodeAudioData(arrayBuffer);
      audioBuffers[soundId] = buffer;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  } catch (e) {
    console.error(`Error playing sound "${soundId}":`, e);
    // If decoding fails, remove from cache to retry next time
    delete audioBuffers[soundId];
  }
};