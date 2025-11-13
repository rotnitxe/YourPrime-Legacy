// services/cameraService.ts
import { Capacitor } from '@capacitor/core';
import type { CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Takes a picture using the device's camera or prompts for a file upload as a fallback.
 * Optimizes the image for storage and performance.
 * @returns A promise that resolves with the base64 data URL of the image, or null if cancelled.
 */
export const takePicture = async (): Promise<string | null> => {
  // Native platform logic using Capacitor Camera
  if (Capacitor.isNativePlatform()) {
    try {
      const { Camera } = await import('@capacitor/camera');
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
          const permissionStatus = await Camera.requestPermissions();
          if (permissionStatus.camera !== 'granted') {
              alert('Se necesita permiso para usar la cámara.');
              return null;
          }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'DataUrl' as CameraResultType, // Use string literal
        source: 'PROMPT' as CameraSource, // Use string literal, lets user choose camera or gallery
      });

      return image.dataUrl || null;

    } catch (error) {
      console.error('Capacitor camera error:', error);
      if (error instanceof Error && error.message.includes("cancelled")) {
          return null;
      }
      alert('No se pudo usar la cámara.');
      return null;
    }
  }

  // Fallback for web/PWA on mobile devices
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // On mobile, this 'capture' attribute often hints to open the camera directly
    input.setAttribute('capture', 'environment');

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error("Error reading file.");
          resolve(null);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null); // User cancelled the file picker
      }
    };

    input.click();
  });
};