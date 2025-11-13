// services/soundService.ts
import { Settings } from '../types';
import { storageService } from './storageService';

// Audio context and buffer cache
let audioContext: AudioContext | null = null;
const audioBuffers: { [key: string]: AudioBuffer } = {};

const SOUND_FILES: { [key: string]: string } = {
  'rest-timer-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/beep.mp3',
  'set-logged-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/toggle.mp3',
  'ui-click-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/click.mp3',
  'tab-switch-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/switch.mp3',
  'new-pr-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/tada.mp3',
  'rep-surplus-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/pop.mp3',
  'session-complete-sound': 'https://cdn.jsdelivr.net/gh/Pixel-Av/public-sound-effects@main/sounds/success.mp3',
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